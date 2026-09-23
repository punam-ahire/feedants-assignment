// Derives all the "live" UI state from the raw competition data + current time.
// This is intentionally NOT stored in the DB — it's computed fresh on every request
// so it's always correct regardless of when the client last fetched data.

function deriveState(comp, userRegistration) {
  const now = new Date();

  let phase;
  if (now < comp.registrationDeadline) {
    phase = 'registration_open';
  } else if (now < comp.submissionStart) {
    phase = 'awaiting_submission_window';
  } else if (now < comp.submissionEnd) {
    phase = 'submission_open';
  } else if (now < comp.resultDate) {
    phase = 'awaiting_results';
  } else {
    phase = 'results_declared';
  }

  const spotsLeft = Math.max(comp.maxSpots - comp.bookedSpots, 0);
  const isFull = comp.bookedSpots >= comp.maxSpots;
  const isRegistered = !!userRegistration;

  return {
    phase,
    spotsLeft,
    isFull,
    isRegistered,
    canRegister: phase === 'registration_open' && !isFull && !isRegistered,
    canSubmit: phase === 'submission_open' && isRegistered,
    hasSubmitted: !!(userRegistration && userRegistration.submissionUrl),
    registrationDeadline: comp.registrationDeadline,
    submissionStart: comp.submissionStart,
    submissionEnd: comp.submissionEnd,
    resultDate: comp.resultDate,
    timeRemainingMs: Math.max(comp.registrationDeadline - now, 0),
  };
}

module.exports = deriveState;