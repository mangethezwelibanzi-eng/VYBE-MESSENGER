import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { COLORS } from '../../constants/theme';
import { useChat } from '../../contexts/ChatContext';

export default function ProfileScreen() {
  const { conversations, blockedChats } = useChat();
  const [displayName, setDisplayName] = useState('Zwelibanzi');
  const [status, setStatus] = useState('Available');
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState('');
  const [tempStatus, setTempStatus] = useState('');

  const totalChats = conversations.length;
  const activeChats = conversations.filter(c => c.online).length;
  const blocked = blockedChats.size;

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const savedName = await AsyncStorage.getItem('vybe_display_name');
      const savedStatus = await AsyncStorage.getItem('vybe_status');
      if (savedName) setDisplayName(savedName);
      if (savedStatus) setStatus(savedStatus);
    } catch {}
  };

  const saveProfile = async () => {
    const newName = tempName.trim() || displayName;
    const newStatus = tempStatus.trim() || status;
    setDisplayName(newName);
    setStatus(newStatus);
    setIsEditing(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    try {
      await AsyncStorage.setItem('vybe_display_name', newName);
      await AsyncStorage.setItem('vybe_status', newStatus);
    } catch {}
  };

  const startEditing = () => {
    setTempName(displayName);
    setTempStatus(status);
    setIsEditing(true);
    Haptics.selectionAsync();
  };

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>PROFILE</Text>
          <Pressable
            onPress={isEditing ? saveProfile : startEditing}
            style={({ pressed }) => [styles.editButton, pressed && { opacity: 0.7 }]}
          >
            <MaterialIcons name={isEditing ? 'check' : 'edit'} size={18} color={isEditing ? COLORS.success : COLORS.muted} />
          </Pressable>
        </View>

        <View style={styles.content}>
          <View style={styles.profileCard}>
            <View style={styles.avatarLarge}>
              <Text style={styles.avatarLargeText}>{displayName.charAt(0)}</Text>
            </View>

            {isEditing ? (
              <View style={styles.editFields}>
                <TextInput
                  style={styles.editInput}
                  value={tempName}
                  onChangeText={setTempName}
                  placeholder="Display name"
                  placeholderTextColor="#555"
                  maxLength={20}
                />
                <TextInput
                  style={[styles.editInput, styles.editInputSmall]}
                  value={tempStatus}
                  onChangeText={setTempStatus}
                  placeholder="Status"
                  placeholderTextColor="#555"
                  maxLength={30}
                />
              </View>
            ) : (
              <>
                <Text style={styles.profileName}>{displayName}</Text>
                <Text style={styles.profileLocation}>Johannesburg, South Africa</Text>
                <View style={styles.statusBadge}>
                  <View style={styles.statusDot} />
                  <Text style={styles.statusText}>{status}</Text>
                </View>
              </>
            )}
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{totalChats}</Text>
              <Text style={styles.statLabel}>CHATS</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: COLORS.success }]}>{activeChats}</Text>
              <Text style={styles.statLabel}>ACTIVE</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: COLORS.accent }]}>{blocked}</Text>
              <Text style={styles.statLabel}>BLOCKED</Text>
            </View>
          </View>

          {/* Settings */}
          <View style={styles.settingsContainer}>
            <Pressable style={({ pressed }) => [styles.settingRow, pressed && { opacity: 0.6 }]}>
              <View style={styles.settingLeft}>
                <MaterialIcons name="notifications" size={22} color={COLORS.muted} />
                <Text style={styles.settingLabel}>Notifications</Text>
              </View>
              <MaterialIcons name="chevron-right" size={22} color={COLORS.muted} />
            </Pressable>

            <View style={styles.divider} />

            <Pressable style={({ pressed }) => [styles.settingRow, pressed && { opacity: 0.6 }]}>
              <View style={styles.settingLeft}>
                <MaterialIcons name="security" size={22} color={COLORS.muted} />
                <Text style={styles.settingLabel}>Privacy</Text>
              </View>
              <MaterialIcons name="chevron-right" size={22} color={COLORS.muted} />
            </Pressable>

            <View style={styles.divider} />

            <Pressable style={({ pressed }) => [styles.settingRow, pressed && { opacity: 0.6 }]}>
              <View style={styles.settingLeft}>
                <MaterialIcons name="data-usage" size={22} color={COLORS.muted} />
                <Text style={styles.settingLabel}>Data Usage</Text>
              </View>
              <MaterialIcons name="chevron-right" size={22} color={COLORS.muted} />
            </Pressable>

            <View style={styles.divider} />

            <Pressable style={({ pressed }) => [styles.settingRow, pressed && { opacity: 0.6 }]}>
              <View style={styles.settingLeft}>
                <MaterialIcons name="palette" size={22} color={COLORS.muted} />
                <Text style={styles.settingLabel}>Appearance</Text>
              </View>
              <MaterialIcons name="chevron-right" size={22} color={COLORS.muted} />
            </Pressable>

            <View style={styles.divider} />

            <Pressable style={({ pressed }) => [styles.settingRow, pressed && { opacity: 0.6 }]}>
              <View style={styles.settingLeft}>
                <MaterialIcons name="info" size={22} color={COLORS.muted} />
                <Text style={styles.settingLabel}>About VYBE</Text>
              </View>
              <MaterialIcons name="chevron-right" size={22} color={COLORS.muted} />
            </Pressable>
          </View>

          <Text style={styles.versionText}>VYBE v1.0.0 • Low-bandwidth protocol</Text>
        </View>
      </ScrollView>
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
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    marginBottom: 24,
  },
  title: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 3,
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  profileCard: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 32,
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#111',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: COLORS.accent,
  },
  avatarLargeText: {
    color: '#FFF',
    fontSize: 32,
    fontWeight: '700',
  },
  profileName: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 6,
  },
  profileLocation: {
    color: COLORS.muted,
    fontSize: 13,
    marginBottom: 14,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 210, 106, 0.1)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.success,
    marginRight: 8,
  },
  statusText: {
    color: COLORS.success,
    fontSize: 12,
    fontWeight: '600',
  },
  editFields: {
    width: '100%',
    gap: 12,
  },
  editInput: {
    backgroundColor: '#111',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#FFF',
    fontSize: 16,
    textAlign: 'center',
  },
  editInputSmall: {
    fontSize: 14,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    color: COLORS.muted,
    fontSize: 9,
    letterSpacing: 2,
    fontWeight: '600',
  },
  settingsContainer: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 8,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  settingLabel: {
    color: '#FFF',
    fontSize: 15,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: 16,
  },
  versionText: {
    color: COLORS.muted,
    fontSize: 11,
    textAlign: 'center',
    marginTop: 24,
    letterSpacing: 1,
  },
});
