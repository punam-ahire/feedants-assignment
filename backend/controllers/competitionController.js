const Competition = require('../models/Competition');
const Registration = require('../models/Registration');
const deriveState = require('../utils/deriveCompetitionState');

// GET /api/competitions/:id
exports.getCompetitionDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId; // set by fakeAuth middleware

    const comp = await Competition.findById(id).lean();
    if (!comp) return res.status(404).json({ message: 'Competition not found' });

    const userRegistration = userId
      ? await Registration.findOne({ competitionId: id, userId }).lean()
      : null;

    const state = deriveState(comp, userRegistration);

    return res.status(200).json({
      competition: comp,
      state,
      userRegistration,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/competitions/:id/winners
exports.getPreviousWinners = async (req, res) => {
  try {
    const comp = await Competition.findById(req.params.id, 'previousWinners').lean();
    if (!comp) return res.status(404).json({ message: 'Competition not found' });
    return res.status(200).json({ winners: comp.previousWinners });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};