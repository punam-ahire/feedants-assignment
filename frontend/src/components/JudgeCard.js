import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, fontSize, spacing, radius } from '../constants/theme';

export default function JudgeCard({ judge }) {
  if (!judge) return null;

  return (
    <View style={styles.card}>
      <Image
        source={{ uri: judge.photoUrl || 'https://placehold.co/100' }}
        style={styles.avatar}
      />
      <View style={{ flex: 1, marginLeft: spacing.md }}>
        <Text style={styles.label}>Judge</Text>
        <Text style={styles.name}>{judge.name}</Text>
        <Text style={styles.subtext}>{judge.title}</Text>
        <Text style={styles.subtext}>{judge.experience}</Text>
      </View>
      <TouchableOpacity style={styles.playButton}>
        <Text style={styles.playIcon}>▶</Text>
        <Text style={styles.playLabel}>Intro Video</Text>
      </TouchableOpacity>
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
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.background,
  },
  label: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  name: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  subtext: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  playButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: {
    fontSize: fontSize.lg,
    color: colors.primary,
  },
  playLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
});