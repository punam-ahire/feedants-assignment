import { View, Text, Image, ScrollView, StyleSheet } from 'react-native';
import { colors, fontSize, spacing, radius } from '../constants/theme';

export default function PreviousWinnersCarousel({ winners }) {
  if (!winners || winners.length === 0) return null;

  return (
    <View style={styles.card}>
      <Text style={styles.heading}>Previous Winners</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {winners.map((winner, idx) => (
          <View key={idx} style={styles.item}>
            <Image
              source={{ uri: winner.photoUrl || 'https://placehold.co/120' }}
              style={styles.photo}
            />
            <Text style={styles.name} numberOfLines={1}>
              {winner.name}
            </Text>
            <Text style={styles.position}>{winner.position}</Text>
          </View>
        ))}
      </ScrollView>
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
  item: {
    width: 110,
    marginRight: spacing.sm,
  },
  photo: {
    width: 110,
    height: 110,
    borderRadius: radius.md,
    backgroundColor: colors.background,
  },
  name: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  position: {
    fontSize: fontSize.xs,
    color: colors.primary,
  },
});