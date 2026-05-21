import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { useChat } from '../../contexts/ChatContext';

export default function QueueScreen() {
  const { conversations, messagesByChat } = useChat();

  const totalMessages = Object.values(messagesByChat).reduce((sum, msgs) => sum + msgs.length, 0);
  const sentMessages = Object.values(messagesByChat).reduce(
    (sum, msgs) => sum + msgs.filter(m => m.mine).length, 0
  );
  const receivedMessages = totalMessages - sentMessages;

  const recentDeliveries = conversations
    .slice(0, 5)
    .map(c => ({
      name: c.name,
      message: c.message,
      time: c.time,
    }));

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>MESSAGE QUEUE</Text>
          <Text style={styles.subtitle}>Delivery status</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.statusCard}>
            <View style={styles.statusIcon}>
              <MaterialIcons name="check-circle" size={48} color={COLORS.success} />
            </View>
            <Text style={styles.statusTitle}>All Clear</Text>
            <Text style={styles.statusMessage}>All messages delivered successfully.</Text>
            <Text style={styles.statusDetail}>No pending items in queue.</Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>0</Text>
              <Text style={styles.statLabel}>PENDING</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: COLORS.success }]}>{sentMessages}</Text>
              <Text style={styles.statLabel}>SENT</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: COLORS.blue }]}>{receivedMessages}</Text>
              <Text style={styles.statLabel}>RECEIVED</Text>
            </View>
          </View>

          {/* Recent deliveries */}
          <Text style={styles.sectionTitle}>RECENT DELIVERIES</Text>
          <View style={styles.deliveriesCard}>
            {recentDeliveries.map((item, index) => (
              <View key={item.name}>
                <View style={styles.deliveryRow}>
                  <View style={styles.deliveryLeft}>
                    <View style={styles.deliveryDot} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.deliveryName}>{item.name}</Text>
                      <Text style={styles.deliveryMessage} numberOfLines={1}>{item.message}</Text>
                    </View>
                  </View>
                  <View style={styles.deliveryRight}>
                    <Text style={styles.deliveryTime}>{item.time}</Text>
                    <MaterialIcons name="check" size={14} color={COLORS.success} />
                  </View>
                </View>
                {index < recentDeliveries.length - 1 ? <View style={styles.divider} /> : null}
              </View>
            ))}
          </View>
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
  subtitle: {
    color: COLORS.muted,
    fontSize: 12,
    letterSpacing: 1,
    marginTop: 6,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  statusCard: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 32,
    alignItems: 'center',
    marginBottom: 16,
  },
  statusIcon: {
    marginBottom: 16,
  },
  statusTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  statusMessage: {
    color: COLORS.muted,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 4,
  },
  statusDetail: {
    color: COLORS.muted,
    fontSize: 12,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 18,
    alignItems: 'center',
  },
  statValue: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 6,
  },
  statLabel: {
    color: COLORS.muted,
    fontSize: 9,
    letterSpacing: 2,
    fontWeight: '600',
  },
  sectionTitle: {
    color: COLORS.muted,
    fontSize: 11,
    letterSpacing: 2,
    fontWeight: '600',
    marginBottom: 12,
  },
  deliveriesCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
  },
  deliveryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  deliveryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  deliveryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.success,
  },
  deliveryName: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  deliveryMessage: {
    color: COLORS.muted,
    fontSize: 12,
  },
  deliveryRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 12,
  },
  deliveryTime: {
    color: COLORS.muted,
    fontSize: 11,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
  },
});
