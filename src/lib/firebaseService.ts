/**
 * Firebase Authentication & Firestore Service
 * Handles user auth, conversations, and messaging
 */

import {
  initializeApp,
  type FirebaseApp,
} from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type Auth,
  type User as FirebaseUser,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  arrayUnion,
  type Firestore,
  type QueryConstraint,
} from "firebase/firestore";
import firebaseConfig, { isFirebaseConfigured } from "./firebase";

// ---- Types ----

export interface VibeUser {
  uid: string;
  email: string;
  displayName: string;
}

export interface FirestoreConversation {
  id: string;
  participants: string[];
  participantNames: Record<string, string>;
  lastMessage: string;
  lastMessageTime: string;
  createdAt: number;
}

export interface FirestoreMessage {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  time: string;
  delivery: "sending" | "queued" | "delivered" | "delayed";
  createdAt: number;
}

// ---- Singleton instances ----

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let firestore: Firestore | null = null;

/**
 * Initialize Firebase (called on first use)
 */
function initializeFirebase() {
  if (!isFirebaseConfigured()) {
    throw new Error("Firebase not configured. Add your config to src/lib/firebase.ts");
  }

  if (!app) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    firestore = getFirestore(app);
  }

  return { app, auth, firestore };
}

// ---- Authentication ----

export async function signUp(
  email: string,
  password: string,
  displayName: string
): Promise<VibeUser> {
  const { auth: authInstance } = initializeFirebase();

  const userCredential = await createUserWithEmailAndPassword(
    authInstance,
    email,
    password
  );

  const user = userCredential.user;

  // Store user profile in Firestore
  const { firestore: db } = initializeFirebase();
  await setDoc(doc(db, "users", user.uid), {
    email: user.email,
    displayName,
    createdAt: serverTimestamp(),
  });

  return {
    uid: user.uid,
    email: user.email || "",
    displayName,
  };
}

export async function signIn(
  email: string,
  password: string
): Promise<VibeUser> {
  const { auth: authInstance } = initializeFirebase();

  const userCredential = await signInWithEmailAndPassword(
    authInstance,
    email,
    password
  );

  const user = userCredential.user;

  return {
    uid: user.uid,
    email: user.email || "",
    displayName: user.displayName || "User",
  };
}

export async function signOutUser(): Promise<void> {
  const { auth: authInstance } = initializeFirebase();
  await firebaseSignOut(authInstance);
}

/**
 * Listen to authentication state changes
 */
export function onAuth(
  callback: (user: VibeUser | null) => void
): () => void {
  const { auth: authInstance } = initializeFirebase();

  return onAuthStateChanged(authInstance, async (firebaseUser) => {
    if (!firebaseUser) {
      callback(null);
      return;
    }

    const { firestore: db } = initializeFirebase();
    const userDoc = await getDocs(
      query(collection(db, "users"), where("email", "==", firebaseUser.email))
    );

    const userData = userDoc.docs[0]?.data();

    callback({
      uid: firebaseUser.uid,
      email: firebaseUser.email || "",
      displayName: userData?.displayName || firebaseUser.displayName || "User",
    });
  });
}

// ---- Conversations ----

export async function startConversation(
  user: VibeUser,
  otherUserEmail: string
): Promise<FirestoreConversation | null> {
  const { firestore: db } = initializeFirebase();

  // Find the other user by email
  const otherUserQuery = query(
    collection(db, "users"),
    where("email", "==", otherUserEmail)
  );
  const otherUserDocs = await getDocs(otherUserQuery);

  if (otherUserDocs.empty) {
    throw new Error(`User ${otherUserEmail} not found`);
  }

  const otherUser = otherUserDocs.docs[0];
  const otherUserId = otherUser.id;
  const otherUserData = otherUser.data();

  // Create conversation ID (sorted UIDs to ensure uniqueness)
  const conversationId = [user.uid, otherUserId].sort().join("_");

  // Create or update conversation
  await setDoc(
    doc(db, "conversations", conversationId),
    {
      participants: [user.uid, otherUserId],
      participantNames: {
        [user.uid]: user.displayName,
        [otherUserId]: otherUserData.displayName,
      },
      lastMessage: "",
      lastMessageTime: "",
      createdAt: serverTimestamp(),
    },
    { merge: true }
  );

  return {
    id: conversationId,
    participants: [user.uid, otherUserId],
    participantNames: {
      [user.uid]: user.displayName,
      [otherUserId]: otherUserData.displayName,
    },
    lastMessage: "",
    lastMessageTime: "",
    createdAt: Date.now(),
  };
}

/**
 * Subscribe to user's conversations
 */
export function subscribeToConversations(
  userId: string,
  callback: (conversations: FirestoreConversation[]) => void
): () => void {
  const { firestore: db } = initializeFirebase();

  const constraints: QueryConstraint[] = [
    where("participants", "array-contains", userId),
    orderBy("createdAt", "desc"),
  ];

  return onSnapshot(
    query(collection(db, "conversations"), ...constraints),
    (snapshot) => {
      const conversations: FirestoreConversation[] = snapshot.docs.map(
        (doc) => ({
          id: doc.id,
          participants: doc.data().participants || [],
          participantNames: doc.data().participantNames || {},
          lastMessage: doc.data().lastMessage || "",
          lastMessageTime: doc.data().lastMessageTime || "",
          createdAt: doc.data().createdAt?.toMillis() || Date.now(),
        })
      );
      callback(conversations);
    },
    (error) => {
      console.error("Error subscribing to conversations:", error);
    }
  );
}

// ---- Messages ----

/**
 * Send a message to a conversation
 */
export async function sendMessage(
  conversationId: string,
  user: VibeUser,
  text: string
): Promise<void> {
  const { firestore: db } = initializeFirebase();

  const messageId = `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  const now = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Add message to subcollection
  await setDoc(
    doc(db, "conversations", conversationId, "messages", messageId),
    {
      conversationId,
      senderId: user.uid,
      text,
      time: now,
      delivery: "delivered",
      createdAt: serverTimestamp(),
    }
  );

  // Update conversation's lastMessage
  await setDoc(
    doc(db, "conversations", conversationId),
    {
      lastMessage: text,
      lastMessageTime: now,
    },
    { merge: true }
  );
}

/**
 * Subscribe to messages in a conversation
 */
export function subscribeToMessages(
  conversationId: string,
  callback: (messages: FirestoreMessage[]) => void
): () => void {
  const { firestore: db } = initializeFirebase();

  return onSnapshot(
    query(
      collection(db, "conversations", conversationId, "messages"),
      orderBy("createdAt", "asc")
    ),
    (snapshot) => {
      const messages: FirestoreMessage[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        conversationId: doc.data().conversationId || conversationId,
        senderId: doc.data().senderId || "",
        text: doc.data().text || "",
        time: doc.data().time || "",
        delivery: doc.data().delivery || "delivered",
        createdAt: doc.data().createdAt?.toMillis() || Date.now(),
      }));
      callback(messages);
    },
    (error) => {
      console.error("Error subscribing to messages:", error);
    }
  );
}
