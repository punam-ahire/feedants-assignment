const Competition = require('../models/Competition');
const Registration = require('../models/Registration');

// POST /api/competitions/:id/register
// This is the most important endpoint in the whole assignment — it has to be
// safe when many users hit it at the exact same time for the last spot.
exports.registerForCompetition = async (req, res) => {
  const { id: competitionId } = req.params;
  const userId = req.userId; // from fakeAuth middleware

  if (!userId) return res.status(401).json({ message: 'Missing user id' });

  try {
    const comp = await Competition.findById(competitionId);
    if (!comp) return res.status(404).json({ message: 'Competition not found' });

    if (new Date() > comp.registrationDeadline) {
      return res.status(400).json({ message: 'Registration is closed' });
    }

    // Reject early if user already registered (fast path, not the source of truth)
    const existing = await Registration.findOne({ competitionId, userId });
    if (existing) {
      return res.status(400).json({ message: 'You are already registered' });
    }

    // ATOMIC STEP: only increments bookedSpots if there is still room.
    // If two requests race for the last spot, only one of these succeeds —
    // MongoDB guarantees this update is atomic at the document level.
    const updatedComp = await Competition.findOneAndUpdate(
      { _id: competitionId, $expr: { $lt: ['$bookedSpots', '$maxSpots'] } },
      { $inc: { bookedSpots: 1 } },
      { new: true }
    );

    if (!updatedComp) {
      return res.status(400).json({ message: 'No spots left' });
    }

    try {
      const registration = await Registration.create({
        competitionId,
        userId,
        paymentStatus: 'pending', // would flip to 'paid' via a payment webhook in production
      });

      return res.status(201).json({
        message: 'Registered successfully',
        registration,
        spotsLeft: updatedComp.maxSpots - updatedComp.bookedSpots,
      });
    } catch (err) {
      // Roll back the spot increment if creating the registration doc fails
      // (e.g. duplicate key error from a race on the unique index)
      await Competition.updateOne({ _id: competitionId }, { $inc: { bookedSpots: -1 } });

      if (err.code === 11000) {
        return res.status(400).json({ message: 'You are already registered' });
      }
      throw err;
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/competitions/:id/submit
// body: { submissionUrl: string }
exports.submitEntry = async (req, res) => {
  const { id: competitionId } = req.params;
  const userId = req.userId;
  const { submissionUrl } = req.body;

  if (!submissionUrl) {
    return res.status(400).json({ message: 'submissionUrl is required' });
  }

  try {
    const comp = await Competition.findById(competitionId);
    if (!comp) return res.status(404).json({ message: 'Competition not found' });

    const now = new Date();
    if (now < comp.submissionStart || now > comp.submissionEnd) {
      return res.status(400).json({ message: 'Submission window is not open' });
    }

    const registration = await Registration.findOne({ competitionId, userId });
    if (!registration) {
      return res.status(403).json({ message: 'You must be registered to submit' });
    }

    registration.submissionUrl = submissionUrl;
    registration.submittedAt = now;
    await registration.save();

    return res.status(200).json({ message: 'Submission received', registration });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};