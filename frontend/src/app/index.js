import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
} from 'react-native';

import { fetchCompetitionDetails } from '../api/competitionApi';
import { colors, fontSize, spacing } from '../constants/theme';

import HeaderCard from '../components/HeaderCard';
import JudgeCard from '../components/JudgeCard';
import CountdownTimer from '../components/CountdownTimer';
import ImportantDatesGrid from '../components/ImportantDatesGrid';
import PreviousWinnersCarousel from '../components/PreviousWinnersCarousel';
import TabbedInfo from '../components/TabbedInfo';
import RewardsList from '../components/RewardsList';
import ActionButton from '../components/ActionButton';

const COMPETITION_ID = '6ab3d638aca12c74d26c9c94';

export default function CompetitionDetailsScreen() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setError(null);
      const result = await fetchCompetitionDetails(COMPETITION_ID);
      setData(result);
    } catch (err) {
      setError('Failed to load competition. Check that the backend server is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (error || !data) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </SafeAreaView>
    );
  }

  const { competition, state } = data;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <HeaderCard competition={competition} state={state} />
        <JudgeCard judge={competition.judge} />

        {state.phase === 'registration_open' && (
          <CountdownTimer deadline={state.registrationDeadline} />
        )}

        <ImportantDatesGrid competition={competition} />
        <PreviousWinnersCarousel winners={competition.previousWinners} />
        <TabbedInfo competition={competition} />
        <RewardsList rewards={competition.rewards} />

        <View style={{ height: spacing.lg }} />
      </ScrollView>

      <ActionButton
        competitionId={COMPETITION_ID}
        state={state}
        onStateChange={loadData}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  errorText: {
    fontSize: fontSize.md,
    color: colors.danger,
    textAlign: 'center',
  },
});