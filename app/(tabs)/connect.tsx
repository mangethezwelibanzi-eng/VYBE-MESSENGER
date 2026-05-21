import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

export default function ConnectScreen() {
  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>NETWORK STATUS</Text>
        <Text style={styles.subtitle}>Connection diagnostics</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.statusCard}>
          <View style={styles.signalContainer}>
            <MaterialIcons name="wifi" size={56} color={COLORS.success} />
            <View style={styles.pulseRing} />
          </View>
          <Text style={styles.statusTitle}>Connected</Text>
          <Text style={styles.statusMessage}>Low-bandwidth communication active</Text>
        </View>

        <View style={styles.metricsContainer}>
          <View style={styles.metricRow}>
            <View style={styles.metricLeft}>
              <MaterialIcons name="speed" size={20} color={COLORS.muted} />
              <Text style={styles.metricLabel}>Latency</Text>
            </View>
            <Text style={styles.metricValue}>42ms</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.metricRow}>
            <View style={styles.metricLeft}>
              <MaterialIcons name="signal-cellular-alt" size={20} color={COLORS.muted} />
              <Text style={styles.metricLabel}>Signal</Text>
            </View>
            <Text style={styles.metricValue}>Strong</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.metricRow}>
            <View style={styles.metricLeft}>
              <MaterialIcons name="data-usage" size={20} color={COLORS.muted} />
              <Text style={styles.metricLabel}>Data Used</Text>
            </View>
            <Text style={styles.metricValue}>1.2 MB</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.metricRow}>
            <View style={styles.metricLeft}>
              <MaterialIcons name="access-time" size={20} color={COLORS.muted} />
              <Text style={styles.metricLabel}>Uptime</Text>
            </View>
            <Text style={styles.metricValue}>4h 23m</Text>
          </View>
        </View>
      </View>
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
    marginBottom: 32,
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
    flex: 1,
    paddingHorizontal: 24,
  },
  statusCard: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 32,
    alignItems: 'center',
    marginBottom: 24,
  },
  signalContainer: {
    marginBottom: 16,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: COLORS.success,
    opacity: 0.3,
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
  },
  metricsContainer: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 20,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  metricLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  metricLabel: {
    color: COLORS.muted,
    fontSize: 14,
  },
  metricValue: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
  },
});
