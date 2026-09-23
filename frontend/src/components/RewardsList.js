import { View, Text, StyleSheet } from 'react-native';
import { colors, fontSize, spacing, radius } from '../constants/theme';

const MEDAL_ICONS = {
  '1st Winner': '🏆',
  '2nd Winner': '🥈',
  '3rd Winner': '🥉',
};

export default function RewardsList({ rewards }) {
  if (!rewards || rewards.length === 0) return null;

  return (
    <View style={styles.card}>
      <Text style={styles.heading}>Rewards (All Positions)</Text>
      {rewards.map((reward, idx) => (
        <View key={idx} style={styles.row}>
          <View style={styles.left}>
            <Text style={styles.icon}>{MEDAL_ICONS[reward.position] || '⭐'}</Text>
            <Text style={styles.position}>{reward.position}</Text>
          </View>
          <Text style={styles.amount}>₹ {reward.amount}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    margin: spacing.md,
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  heading: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    fontSize: fontSize.md,
    marginRight: spacing.sm,
  },
  position: {
    fontSize: fontSize.sm,
    color: colors.textPrimary,
  },
  amount: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.primary,
  },
});