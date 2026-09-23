const mongoose = require('mongoose');

const competitionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    tags: [String], // e.g. ["Dance", "Multi-Win"]
    category: String,

    prizePool: { type: Number, required: true },
    entryFee: { type: Number, required: true },

    maxSpots: { type: Number, default: 20 },
    bookedSpots: { type: Number, default: 0 },

    judge: {
      name: String,
      title: String,
      experience: String,
      photoUrl: String,
      introVideoUrl: String,
    },

    registrationDeadline: { type: Date, required: true },
    submissionStart: { type: Date, required: true },
    submissionEnd: { type: Date, required: true },
    resultDate: { type: Date, required: true },

    aboutText: String,
    judgingParameters: String,
    rulesAndEligibility: String,

    rewards: [
      {
        position: String, // "1st Winner"
        amount: Number,
      },
    ],

    previousWinners: [
      {
        name: String,
        position: String, // "1st Winner"
        photoUrl: String,
        videoUrl: String,
      },
    ],

    status: {
      type: String,
      enum: ['upcoming', 'open', 'closed', 'results_declared'],
      default: 'open',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Competition', competitionSchema);