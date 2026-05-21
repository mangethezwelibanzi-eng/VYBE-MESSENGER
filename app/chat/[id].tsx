import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  FlatList,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAlert } from '@/template';
import { COLORS } from '../../constants/theme';
import { useChat } from '../../contexts/ChatContext';

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { showAlert } = useAlert();
  const {
    messagesByChat,
    typingChats,
    mutedChats,
    sendMessage: sendChatMessage,
    deleteChat,
    blockChat,
    toggleMute,
    getConversation,
    markAsRead,
  } = useChat();

  const [message, setMessage] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const chat = getConversation(id || '');
  const currentMessages = messagesByChat[id || ''] || [];

  useEffect(() => {
    if (id) markAsRead(id);
  }, [id]);

  useEffect(() => {
    if (flatListRef.current && currentMessages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [currentMessages.length]);

  if (!chat) {
    return (
      <SafeAreaView edges={['top']} style={styles.container}>
        <View style={styles.emptyContainer}>
          <MaterialIcons name="chat-bubble-outline" size={48} color={COLORS.muted} />
          <Text style={styles.emptyText}>Chat not found</Text>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const handleSend = () => {
    if (!message.trim()) return;
    Haptics.selectionAsync();
    sendChatMessage(id!, message);
    setMessage('');
  };

  const handleMenuOption = (option: string) => {
    setShowMenu(false);
    switch (option) {
      case 'profile':
        showAlert('Profile', `${chat.name}\nStatus: ${chat.online ? 'Online' : 'Offline'}\nConnection: ${chat.online ? 'Stable' : 'Disconnected'}`);
        break;
      case 'mute':
        toggleMute(id!);
        Haptics.selectionAsync();
        break;
      case 'delete':
        showAlert('Delete Chat', `Delete chat with ${chat.name}?`, [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => {
              deleteChat(id!);
              router.back();
            },
          },
        ]);
        break;
      case 'block':
        showAlert('Block User', `Block ${chat.name}? This will remove the conversation.`, [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Block',
            style: 'destructive',
            onPress: () => {
              blockChat(id!);
              router.back();
            },
          },
        ]);
        break;
    }
  };

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={{ flex: 1 }}>
          {/* Header */}
          <View style={styles.chatHeader}>
            <Pressable
              onPress={() => router.back()}
              hitSlop={12}
              style={({ pressed }) => pressed ? { opacity: 0.6 } : undefined}
            >
              <MaterialIcons name="arrow-back" size={24} color={COLORS.accent} />
            </Pressable>

            <View style={styles.chatProfile}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{chat.name.charAt(0)}</Text>
                <View style={[styles.headerOnlineDot, { backgroundColor: chat.online ? COLORS.success : '#555' }]} />
              </View>
              <View>
                <Text style={styles.chatName}>{chat.name}</Text>
                <Text style={[styles.onlineText, { color: chat.online ? COLORS.success : COLORS.muted }]}>
                  {typingChats.has(id!) ? 'typing...' : chat.online ? 'stable connection' : 'offline'}
                </Text>
              </View>
            </View>

            <Pressable
              onPress={() => setShowMenu(!showMenu)}
              hitSlop={12}
              style={({ pressed }) => pressed ? { opacity: 0.6 } : undefined}
            >
              <MaterialIcons name="more-vert" size={24} color={COLORS.accent} />
            </Pressable>
          </View>

          {/* Menu */}
          {showMenu ? (
            <Pressable style={styles.menuBackdrop} onPress={() => setShowMenu(false)}>
              <View style={styles.menuContainer}>
                <Pressable style={styles.menuItem} onPress={() => handleMenuOption('profile')}>
                  <MaterialIcons name="person" size={18} color={COLORS.muted} />
                  <Text style={styles.menuItemText}>View Profile</Text>
                </Pressable>
                <Pressable style={styles.menuItem} onPress={() => handleMenuOption('mute')}>
                  <MaterialIcons
                    name={mutedChats.has(id!) ? 'notifications' : 'notifications-off'}
                    size={18}
                    color={COLORS.muted}
                  />
                  <Text style={styles.menuItemText}>
                    {mutedChats.has(id!) ? 'Unmute Chat' : 'Mute Chat'}
                  </Text>
                </Pressable>
                <View style={styles.menuDivider} />
                <Pressable style={styles.menuItem} onPress={() => handleMenuOption('delete')}>
                  <MaterialIcons name="delete" size={18} color={COLORS.accent} />
                  <Text style={[styles.menuItemText, { color: COLORS.accent }]}>Delete Chat</Text>
                </Pressable>
                <Pressable style={styles.menuItem} onPress={() => handleMenuOption('block')}>
                  <MaterialIcons name="block" size={18} color={COLORS.accent} />
                  <Text style={[styles.menuItemText, { color: COLORS.accent }]}>Block User</Text>
                </Pressable>
              </View>
            </Pressable>
          ) : null}

          {/* Muted indicator */}
          {mutedChats.has(id!) ? (
            <View style={styles.mutedBanner}>
              <MaterialIcons name="notifications-off" size={14} color={COLORS.muted} />
              <Text style={styles.mutedText}>Notifications muted</Text>
            </View>
          ) : null}

          {/* Today divider */}
          <View style={styles.todayRow}>
            <View style={styles.line} />
            <Text style={styles.todayText}>TODAY</Text>
            <View style={styles.line} />
          </View>

          {/* Messages */}
          <FlatList
            ref={flatListRef}
            data={currentMessages}
            keyExtractor={item => item.id}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 12 }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={() => (
              <View style={styles.emptyMessages}>
                <MaterialIcons name="forum" size={36} color={COLORS.muted} />
                <Text style={styles.emptyMessagesText}>Start the conversation</Text>
              </View>
            )}
            renderItem={({ item }) => (
              <View style={[styles.messageRow, item.mine ? styles.myRow : styles.theirRow]}>
                {!item.mine ? (
                  <View style={styles.smallAvatar}>
                    <Text style={styles.smallAvatarText}>{chat.name.charAt(0)}</Text>
                  </View>
                ) : null}
                <View
                  style={[styles.messageBubble, item.mine ? styles.myBubble : styles.theirBubble]}
                >
                  <Text style={styles.messageText}>{item.text}</Text>
                  <View style={styles.messageFooter}>
                    <Text style={styles.messageTime}>{item.time}</Text>
                    <Text style={{ color: item.mine ? COLORS.accent : COLORS.blue, fontSize: 10 }}>
                      ✓✓
                    </Text>
                  </View>
                </View>
              </View>
            )}
          />

          {/* Typing indicator */}
          {typingChats.has(id!) ? (
            <View style={[styles.messageRow, styles.theirRow, { paddingHorizontal: 20, marginBottom: 8 }]}>
              <View style={styles.smallAvatar}>
                <Text style={styles.smallAvatarText}>{chat.name.charAt(0)}</Text>
              </View>
              <View style={[styles.messageBubble, styles.theirBubble, styles.typingBubble]}>
                <Text style={styles.typingDots}>• • •</Text>
              </View>
            </View>
          ) : null}

          {/* Input */}
          <View style={[styles.inputContainer, { paddingBottom: insets.bottom + 12 }]}>
            <TextInput
              style={styles.input}
              placeholder="Send message..."
              placeholderTextColor="#555"
              value={message}
              onChangeText={setMessage}
              onSubmitEditing={handleSend}
              returnKeyType="send"
              multiline
              maxLength={500}
            />
            <Pressable
              style={({ pressed }) => [
                styles.sendButton,
                message.trim() ? styles.sendButtonActive : null,
                pressed && message.trim() ? { opacity: 0.7, transform: [{ scale: 0.92 }] } : null,
              ]}
              onPress={handleSend}
              disabled={!message.trim()}
            >
              <MaterialIcons
                name="send"
                size={20}
                color={message.trim() ? '#FFF' : COLORS.muted}
              />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  emptyText: {
    color: COLORS.muted,
    fontSize: 16,
  },
  backBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    marginTop: 8,
  },
  backBtnText: {
    color: '#FFF',
    fontSize: 14,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  chatProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 16,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#111',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    position: 'relative',
  },
  avatarText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  headerOnlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  chatName: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  onlineText: {
    fontSize: 11,
  },
  menuBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 99,
  },
  menuContainer: {
    position: 'absolute',
    top: 60,
    right: 20,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 8,
    zIndex: 100,
    minWidth: 190,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  menuItemText: {
    color: '#FFF',
    fontSize: 14,
  },
  menuDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: 16,
    marginVertical: 4,
  },
  mutedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 6,
    backgroundColor: 'rgba(13,13,13,0.8)',
  },
  mutedText: {
    color: COLORS.muted,
    fontSize: 11,
  },
  todayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  todayText: {
    color: COLORS.muted,
    fontSize: 10,
    marginHorizontal: 14,
    letterSpacing: 2,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-end',
  },
  myRow: {
    justifyContent: 'flex-end',
  },
  theirRow: {
    justifyContent: 'flex-start',
  },
  smallAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#111',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  smallAvatarText: {
    color: '#FFF',
    fontSize: 12,
  },
  messageBubble: {
    maxWidth: '76%',
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 20,
    borderWidth: 1,
  },
  theirBubble: {
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderBottomLeftRadius: 4,
  },
  myBubble: {
    backgroundColor: '#1A040A',
    borderColor: '#340814',
    borderBottomRightRadius: 4,
  },
  typingBubble: {
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  typingDots: {
    color: COLORS.muted,
    fontSize: 16,
    letterSpacing: 2,
  },
  messageText: {
    color: '#FFF',
    fontSize: 14,
    lineHeight: 20,
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    gap: 12,
  },
  messageTime: {
    color: COLORS.muted,
    fontSize: 10,
  },
  emptyMessages: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    gap: 12,
  },
  emptyMessagesText: {
    color: COLORS.muted,
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 10,
    alignItems: 'flex-end',
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 18,
    paddingVertical: 12,
    paddingTop: 12,
    color: '#FFF',
    fontSize: 14,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
});
