import { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { colors, fontSize, spacing, radius } from '../constants/theme';
import { registerForCompetition, submitEntry } from '../api/competitionApi';

export default function ActionButton({ competitionId, state, onStateChange }) {
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setLoading(true);
    try {
      await registerForCompetition(competitionId);
      Alert.alert('Success', 'You are registered!');
      onStateChange(); // tells the parent to refetch competition details
    } catch (err) {
      const msg = err.response?.data?.message || 'Something went wrong';
      Alert.alert('Registration failed', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // In a real app this would open a file/video picker and upload it.
      // For this assignment we simulate it with a placeholder URL.
      await submitEntry(competitionId, 'https://example.com/my-submission.mp4');
      Alert.alert('Success', 'Submission uploaded!');
      onStateChange();
    } catch (err) {
      const msg = err.response?.data?.message || 'Something went wrong';
      Alert.alert('Submission failed', msg);
    } finally {
      setLoading(false);
    }
  };

  // Decide what to show based on the derived state from the backend.
  let label;
  let onPress;
  let disabled = false;

  if (state.hasSubmitted) {
    label = 'Submission Uploaded ✓';
    disabled = true;
  } else if (state.canSubmit) {
    label = 'Upload Submission';
    onPress = handleSubmit;
  } else if (state.isRegistered && state.phase === 'awaiting_submission_window') {
    label = 'Submission opens soon';
    disabled = true;
  } else if (state.isRegistered && state.phase === 'awaiting_results') {
    label = 'Awaiting Results';
    disabled = true;
  } else if (state.isRegistered && state.phase === 'results_declared') {
    label = 'Results Declared';
    disabled = true;
  } else if (state.isRegistered) {
    label = 'Registered';
    disabled = true;
  } else if (state.isFull) {
    label = 'Registration Full';
    disabled = true;
  } else if (state.phase !== 'registration_open') {
    label = 'Registration Closed';
    disabled = true;
  } else {
    label = 'Register Now';
    onPress = handleRegister;
  }

  return (
    <TouchableOpacity
      style={[styles.button, disabled && styles.buttonDisabled]}
      onPress={onPress}
      disabled={disabled || loading || !onPress}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={styles.buttonText}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    margin: spacing.md,
  },
  buttonDisabled: {
    backgroundColor: colors.textSecondary,
  },
  buttonText: {
    color: '#fff',
    fontSize: fontSize.md,
    fontWeight: '700',
  },
});