import React, { createContext, useContext, useState, useRef, useEffect } from 'react';

export type Message = {
  id: string;
  text: string;
  time: string;
  mine: boolean;
};

export type Conversation = {
  id: string;
  name: string;
  message: string;
  time: string;
  online: boolean;
  unread: number;
};

type ChatContextType = {
  conversations: Conversation[];
  messagesByChat: Record<string, Message[]>;
  mutedChats: Set<string>;
  blockedChats: Set<string>;
  typingChats: Set<string>;
  sendMessage: (chatId: string, text: string) => void;
  deleteChat: (chatId: string) => void;
  blockChat: (chatId: string) => void;
  toggleMute: (chatId: string) => void;
  getConversation: (chatId: string) => Conversation | undefined;
  createChat: (name: string) => string;
  markAsRead: (chatId: string) => void;
};

const ChatContext = createContext<ChatContextType>({} as ChatContextType);

const initialConversations: Conversation[] = [
  { id: '1', name: 'Lerato', message: 'Signal recovered on my side.', time: '08:51', online: true, unread: 1 },
  { id: '2', name: 'Operations', message: 'Queue sync completed.', time: '08:42', online: true, unread: 0 },
  { id: '3', name: 'Thabo', message: 'Low data mode active.', time: '08:32', online: false, unread: 0 },
  { id: '4', name: 'Naledi', message: 'Meeting rescheduled to 3pm.', time: '08:21', online: true, unread: 2 },
  { id: '5', name: 'Sipho', message: 'File uploaded successfully.', time: '08:15', online: false, unread: 0 },
  { id: '6', name: 'Zanele', message: 'Connection stable now.', time: '07:58', online: true, unread: 1 },
  { id: '7', name: 'Bongani', message: 'Bandwidth allocation done.', time: '07:45', online: false, unread: 0 },
  { id: '8', name: 'Ayanda', message: 'Node 7 back online.', time: '07:32', online: true, unread: 0 },
  { id: '9', name: 'Mandla', message: 'Patch deployed.', time: '07:20', online: false, unread: 3 },
  { id: '10', name: 'Lindiwe', message: 'Latency improved.', time: '07:11', online: true, unread: 0 },
];

const initialMessages: Record<string, Message[]> = {
  '1': [
    { id: '1', text: 'Signal recovered on my side.', time: '08:51', mine: false },
    { id: '2', text: 'Nice. Queue sync looks stable.', time: '08:53', mine: true },
  ],
  '2': [{ id: '1', text: 'Queue sync completed.', time: '08:42', mine: false }],
  '3': [{ id: '1', text: 'Low data mode active.', time: '08:32', mine: true }],
  '4': [
    { id: '1', text: 'Can we move the meeting?', time: '08:18', mine: false },
    { id: '2', text: 'Sure, what time works?', time: '08:19', mine: true },
    { id: '3', text: 'Meeting rescheduled to 3pm.', time: '08:21', mine: false },
  ],
  '5': [{ id: '1', text: 'File uploaded successfully.', time: '08:15', mine: false }],
  '6': [
    { id: '1', text: 'Is the connection dropping?', time: '07:55', mine: true },
    { id: '2', text: 'Connection stable now.', time: '07:58', mine: false },
  ],
  '7': [{ id: '1', text: 'Bandwidth allocation done.', time: '07:45', mine: false }],
  '8': [{ id: '1', text: 'Node 7 back online.', time: '07:32', mine: false }],
  '9': [{ id: '1', text: 'Patch deployed.', time: '07:20', mine: false }],
  '10': [{ id: '1', text: 'Latency improved.', time: '07:11', mine: false }],
};

const generateId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [messagesByChat, setMessagesByChat] = useState<Record<string, Message[]>>(initialMessages);
  const [mutedChats, setMutedChats] = useState<Set<string>>(new Set());
  const [blockedChats, setBlockedChats] = useState<Set<string>>(new Set());
  const [typingChats, setTypingChats] = useState<Set<string>>(new Set());
  const replyTimeouts = useRef<Record<string, NodeJS.Timeout>>({});

  useEffect(() => {
    return () => {
      Object.values(replyTimeouts.current).forEach(clearTimeout);
    };
  }, []);

  const simulateReply = (chatId: string) => {
    if (mutedChats.has(chatId)) return;
    if (replyTimeouts.current[chatId]) clearTimeout(replyTimeouts.current[chatId]);

    setTypingChats(prev => {
      const updated = new Set(prev);
      updated.add(chatId);
      return updated;
    });

    const timeout = setTimeout(() => {
      setTypingChats(prev => {
        const updated = new Set(prev);
        updated.delete(chatId);
        return updated;
      });

      const replies = ['Got it.', 'Copy that.', 'Received.', 'Perfect.', 'Acknowledged.', 'Noted.', 'On it.', 'Roger.'];
      const randomReply = replies[Math.floor(Math.random() * replies.length)];

      const replyMsg: Message = {
        id: generateId(),
        text: randomReply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        mine: false,
      };

      setMessagesByChat(prev => ({
        ...prev,
        [chatId]: [...(prev[chatId] || []), replyMsg],
      }));

      setConversations(prev =>
        prev.map(chat =>
          chat.id === chatId
            ? { ...chat, message: randomReply, time: replyMsg.time, unread: chat.unread + 1 }
            : chat
        )
      );
    }, 1600);

    replyTimeouts.current[chatId] = timeout;
  };

  const sendMessage = (chatId: string, text: string) => {
    if (!text.trim()) return;
    const chat = conversations.find(c => c.id === chatId);
    if (!chat) return;

    const newMessage: Message = {
      id: generateId(),
      text: text.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      mine: true,
    };

    setMessagesByChat(prev => ({
      ...prev,
      [chatId]: [...(prev[chatId] || []), newMessage],
    }));

    setConversations(prev =>
      prev.map(c =>
        c.id === chatId
          ? { ...c, message: newMessage.text, time: newMessage.time }
          : c
      )
    );

    simulateReply(chatId);
  };

  const deleteChat = (chatId: string) => {
    if (replyTimeouts.current[chatId]) {
      clearTimeout(replyTimeouts.current[chatId]);
      delete replyTimeouts.current[chatId];
    }
    setTypingChats(prev => {
      const updated = new Set(prev);
      updated.delete(chatId);
      return updated;
    });
    setConversations(prev => prev.filter(c => c.id !== chatId));
    setMessagesByChat(prev => {
      const updated = { ...prev };
      delete updated[chatId];
      return updated;
    });
  };

  const blockChat = (chatId: string) => {
    if (replyTimeouts.current[chatId]) {
      clearTimeout(replyTimeouts.current[chatId]);
      delete replyTimeouts.current[chatId];
    }
    setTypingChats(prev => {
      const updated = new Set(prev);
      updated.delete(chatId);
      return updated;
    });
    setBlockedChats(prev => {
      const updated = new Set(prev);
      updated.add(chatId);
      return updated;
    });
    setConversations(prev => prev.filter(c => c.id !== chatId));
    setMessagesByChat(prev => {
      const updated = { ...prev };
      delete updated[chatId];
      return updated;
    });
  };

  const toggleMute = (chatId: string) => {
    setMutedChats(prev => {
      const updated = new Set(prev);
      updated.has(chatId) ? updated.delete(chatId) : updated.add(chatId);
      return updated;
    });
  };

  const getConversation = (chatId: string) => conversations.find(c => c.id === chatId);

  const createChat = (name: string): string => {
    const id = generateId();
    const newConversation: Conversation = {
      id,
      name,
      message: 'New conversation',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      online: Math.random() > 0.4,
      unread: 0,
    };
    setConversations(prev => [newConversation, ...prev]);
    setMessagesByChat(prev => ({ ...prev, [id]: [] }));
    return id;
  };

  const markAsRead = (chatId: string) => {
    setConversations(prev =>
      prev.map(c => (c.id === chatId ? { ...c, unread: 0 } : c))
    );
  };

  return (
    <ChatContext.Provider
      value={{
        conversations,
        messagesByChat,
        mutedChats,
        blockedChats,
        typingChats,
        sendMessage,
        deleteChat,
        blockChat,
        toggleMute,
        getConversation,
        createChat,
        markAsRead,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => useContext(ChatContext);
