import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { COLORS } from '../../constants/theme';
import { useChat } from '../../contexts/ChatContext';

export default function ChatsScreen() {
  const router = useRouter();
  const { conversations, blockedChats, markAsRead } = useChat();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const visibleConversations = conversations.filter(c => {
    if (blockedChats.has(c.id)) return false;
    if (searchQuery.trim()) {
      return c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.message.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  const totalUnread = conversations.reduce((sum, c) => sum + c.unread, 0);

  const handleChatPress = useCallback((chatId: string) => {
    Haptics.selectionAsync();
    markAsRead(chatId);
    router.push(`/chat/${chatId}`);
  }, [markAsRead, router]);

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <View style={styles.header}>
        <View>
          <View style={styles.logoRow}>
            <View style={styles.logoBox}>
              <Text style={styles.logoV}>V</Text>
            </View>
            <Text style={styles.logo}>VYBE</Text>
          </View>
          <Text style={styles.tagline}>COMMUNICATE • ADAPT • CONNECT</Text>
        </View>

        <View style={styles.headerRight}>
          <Pressable
            style={styles.iconButton}
            onPress={() => setShowSearch(!showSearch)}
            hitSlop={8}
          >
            <MaterialIcons
              name={showSearch ? 'close' : 'search'}
              size={20}
              color={COLORS.muted}
            />
          </Pressable>
          <View style={styles.stableBadge}>
            <View style={styles.stableDot} />
            <Text style={styles.stableText}>STABLE</Text>
          </View>
        </View>
      </View>

      {showSearch && (
        <View style={styles.searchContainer}>
          <MaterialIcons name="search" size={20} color={COLORS.muted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search conversations..."
            placeholderTextColor="#555"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')}>
              <MaterialIcons name="close" size={18} color={COLORS.muted} />
            </Pressable>
          )}
        </View>
      )}

      {totalUnread > 0 && !showSearch ? (
        <View style={styles.unreadBanner}>
          <View style={styles.unreadDot} />
          <Text style={styles.unreadText}>{totalUnread} unread message{totalUnread > 1 ? 's' : ''}</Text>
        </View>
      ) : null}

      <FlashList
        data={visibleConversations}
        estimatedItemSize={88}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [styles.chatCard, pressed && styles.chatCardPressed]}
            onPress={() => handleChatPress(item.id)}
          >
            <View style={styles.chatRow}>
              <View style={styles.avatarWrapper}>
                <View style={[styles.avatar, item.unread > 0 && styles.avatarUnread]}>
                  <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
                </View>
                <View
                  style={[
                    styles.onlineDot,
                    { backgroundColor: item.online ? COLORS.success : '#555' },
                  ]}
                />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.chatTitleRow}>
                  <Text style={[styles.chatTitle, item.unread > 0 && styles.chatTitleUnread]}>
                    {item.name}
                  </Text>
                  {item.unread > 0 && (
                    <View style={styles.unreadBadge}>
                      <Text style={styles.unreadBadgeText}>{item.unread}</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.chatMessage, item.unread > 0 && styles.chatMessageUnread]} numberOfLines={1}>
                  {item.message}
                </Text>
              </View>
              <View style={styles.chatMeta}>
                <Text style={[styles.chatTime, item.unread > 0 && styles.chatTimeUnread]}>{item.time}</Text>
                <Text style={styles.tick}>✓✓</Text>
              </View>
            </View>
          </Pressable>
        )}
        keyExtractor={item => item.id}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListEmptyComponent={() => (
          <View style={styles.emptyList}>
            <MaterialIcons name="chat-bubble-outline" size={48} color={COLORS.muted} />
            <Text style={styles.emptyText}>
              {searchQuery ? 'No conversations found' : 'No conversations yet'}
            </Text>
          </View>
        )}
      />

      {/* FAB - New Chat */}
      <Pressable
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          router.push('/new-chat');
        }}
      >
        <MaterialIcons name="edit" size={22} color="#FFF" />
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    paddingTop: 16,
    marginBottom: 16,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  logoV: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '700',
  },
  logo: {
    color: '#FFF',
    fontSize: 24,
    letterSpacing: 6,
    fontWeight: '700',
  },
  tagline: {
    color: COLORS.muted,
    fontSize: 9,
    letterSpacing: 2,
    marginTop: 10,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  stableBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  stableDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.success,
    marginRight: 8,
  },
  stableText: {
    color: '#FFF',
    fontSize: 10,
    letterSpacing: 2,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    color: '#FFF',
    fontSize: 14,
    paddingVertical: 4,
  },
  unreadBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 12,
    gap: 8,
  },
  unreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.accent,
  },
  unreadText: {
    color: COLORS.accent,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  chatCard: {
    backgroundColor: COLORS.card,
    borderRadius: 22,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chatCardPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  chatRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrapper: {
    marginRight: 14,
    position: 'relative',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#111',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarUnread: {
    borderWidth: 2,
    borderColor: COLORS.accent,
  },
  avatarText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '600',
  },
  onlineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    position: 'absolute',
    right: -1,
    bottom: -1,
    borderWidth: 2,
    borderColor: COLORS.card,
  },
  chatTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  chatTitle: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '500',
  },
  chatTitleUnread: {
    fontWeight: '700',
  },
  chatMessage: {
    color: COLORS.muted,
    fontSize: 13,
  },
  chatMessageUnread: {
    color: '#CCC',
  },
  unreadBadge: {
    backgroundColor: COLORS.accent,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadBadgeText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },
  chatMeta: {
    alignItems: 'flex-end',
    marginLeft: 12,
  },
  chatTime: {
    color: COLORS.muted,
    fontSize: 11,
    marginBottom: 6,
  },
  chatTimeUnread: {
    color: COLORS.accent,
  },
  tick: {
    color: COLORS.blue,
    fontSize: 10,
    letterSpacing: -2,
  },
  emptyList: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    gap: 16,
  },
  emptyText: {
    color: COLORS.muted,
    fontSize: 14,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  fabPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.92 }],
  },
});
