const express = require('express');
const router = express.Router();

const {
  getCompetitionDetails,
  getPreviousWinners,
} = require('../controllers/competitionController');

const {
  registerForCompetition,
  submitEntry,
} = require('../controllers/registrationController');

router.get('/:id', getCompetitionDetails);
router.get('/:id/winners', getPreviousWinners);
router.post('/:id/register', registerForCompetition);
router.post('/:id/submit', submitEntry);

module.exports = router;