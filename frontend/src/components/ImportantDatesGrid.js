import { View, Text, StyleSheet } from 'react-native';
import { colors, fontSize, spacing, radius } from '../constants/theme';

function formatDate(dateStr) {
  const d = new Date(dateStr);
  const day = d.getDate();
  const month = d.toLocaleString('en-US', { month: 'short' });
  const year = d.getFullYear().toString().slice(-2);
  let hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return {
    date: `${day} ${month} ${year}`,
    time: `${hours}:${minutes} ${ampm}`,
  };
}

function DateBlock({ icon, label, value }) {
  const { date, time } = formatDate(value);
  return (
    <View style={styles.block}>
      <Text style={styles.icon}>{icon}</Text>
      <View>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.date}>{date}</Text>
        <Text style={styles.time}>{time}</Text>
      </View>
    </View>
  );
}

export default function ImportantDatesGrid({ competition }) {
  const { registrationDeadline, submissionStart, submissionEnd, resultDate } = competition;

  return (
    <View style={styles.card}>
      <Text style={styles.heading}>Important Dates</Text>
      <View style={styles.grid}>
        <DateBlock icon="📅" label="Register Before" value={registrationDeadline} />
        <DateBlock icon="📤" label="Submission Starts" value={submissionStart} />
        <DateBlock icon="⬆️" label="Submission Ends" value={submissionEnd} />
        <DateBlock icon="🏆" label="Result Date" value={resultDate} />
      </View>
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  block: {
    width: '50%',
    flexDirection: 'row',
    paddingVertical: spacing.sm,
    paddingRight: spacing.sm,
  },
  icon: {
    fontSize: fontSize.md,
    marginRight: spacing.sm,
  },
  label: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  date: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  time: {
    fontSize: fontSize.xs,
    color: colors.textPrimary,
  },
});