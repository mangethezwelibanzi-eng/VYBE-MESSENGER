/**
 * Firebase configuration.
 * 
 * To set up:
 * 1. Go to https://console.firebase.google.com
 * 2. Create a new project
 * 3. Enable Authentication (Email/Password)
 * 4. Create a Firestore Database
 * 5. Add a Web App and copy the config below
 * 
 * Replace the placeholder config with your own.
 */

// ⚠️ IMPORTANT: Replace these with your Firebase project credentials
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
};

/**
 * Check if Firebase is properly configured.
 * Returns false if any required field is still a placeholder.
 */
export function isFirebaseConfigured(): boolean {
  return (
    firebaseConfig.apiKey &&
    firebaseConfig.apiKey !== "YOUR_API_KEY" &&
    firebaseConfig.projectId &&
    firebaseConfig.projectId !== "YOUR_PROJECT_ID"
  );
}

export default firebaseConfig;
