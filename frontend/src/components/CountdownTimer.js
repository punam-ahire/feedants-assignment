import { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fontSize, spacing, radius } from '../constants/theme';

export default function CountdownTimer({ deadline }) {
  const [remaining, setRemaining] = useState(new Date(deadline) - new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining(new Date(deadline) - new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, [deadline]);

  if (remaining <= 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.label}>Registration closed</Text>
      </View>
    );
  }

  const d = Math.floor(remaining / 86400000);
  const h = Math.floor((remaining % 86400000) / 3600000);
  const m = Math.floor((remaining % 3600000) / 60000);
  const s = Math.floor((remaining % 60000) / 1000);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Registration closes in</Text>
      <Text style={styles.time}>
        {d}d : {h.toString().padStart(2, '0')}h : {m.toString().padStart(2, '0')}m :{' '}
        {s.toString().padStart(2, '0')}s
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primaryLight,
    borderRadius: radius.md,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
  },
  label: {
    color: colors.primary,
    fontSize: fontSize.sm,
    marginBottom: 2,
  },
  time: {
    color: colors.primary,
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
});