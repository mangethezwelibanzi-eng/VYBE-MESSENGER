import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { COLORS } from '../constants/theme';
import { useChat } from '../contexts/ChatContext';

const suggestedContacts = [
  { name: 'Kagiso', status: 'Node operator' },
  { name: 'Tumelo', status: 'Network admin' },
  { name: 'Keabetswe', status: 'Signal analyst' },
  { name: 'Dineo', status: 'Relay coordinator' },
  { name: 'Tshepo', status: 'Data specialist' },
  { name: 'Puleng', status: 'Queue manager' },
];

export default function NewChatScreen() {
  const router = useRouter();
  const { createChat } = useChat();
  const [name, setName] = useState('');

  const handleCreate = (contactName: string) => {
    if (!contactName.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const chatId = createChat(contactName.trim());
    router.replace(`/chat/${chatId}`);
  };

  const filteredContacts = name.trim()
    ? suggestedContacts.filter(c =>
        c.name.toLowerCase().includes(name.toLowerCase())
      )
    : suggestedContacts;

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <MaterialIcons name="close" size={24} color={COLORS.muted} />
        </Pressable>
        <Text style={styles.title}>NEW CHAT</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.inputContainer}>
        <MaterialIcons name="person-add" size={20} color={COLORS.muted} />
        <TextInput
          style={styles.input}
          placeholder="Enter contact name..."
          placeholderTextColor="#555"
          value={name}
          onChangeText={setName}
          autoFocus
          returnKeyType="done"
          onSubmitEditing={() => handleCreate(name)}
        />
        {name.trim().length > 0 && (
          <Pressable
            style={styles.createButton}
            onPress={() => handleCreate(name)}
          >
            <MaterialIcons name="arrow-forward" size={20} color="#FFF" />
          </Pressable>
        )}
      </View>

      <Text style={styles.sectionTitle}>SUGGESTED CONTACTS</Text>

      <FlatList
        data={filteredContacts}
        keyExtractor={item => item.name}
        contentContainerStyle={{ paddingHorizontal: 20 }}
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [styles.contactCard, pressed && styles.contactPressed]}
            onPress={() => handleCreate(item.name)}
          >
            <View style={styles.contactAvatar}>
              <Text style={styles.contactAvatarText}>{item.name.charAt(0)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.contactName}>{item.name}</Text>
              <Text style={styles.contactStatus}>{item.status}</Text>
            </View>
            <MaterialIcons name="chat-bubble-outline" size={18} color={COLORS.muted} />
          </Pressable>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
      />
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  input: {
    flex: 1,
    color: '#FFF',
    fontSize: 15,
    paddingVertical: 4,
  },
  createButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    color: COLORS.muted,
    fontSize: 11,
    letterSpacing: 2,
    fontWeight: '600',
    paddingHorizontal: 24,
    marginBottom: 14,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 14,
  },
  contactPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  contactAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#111',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  contactAvatarText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  contactName: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  contactStatus: {
    color: COLORS.muted,
    fontSize: 12,
  },
});
