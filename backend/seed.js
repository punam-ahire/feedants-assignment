// Run this once with: node seed.js
// It wipes and repopulates the DB with data matching the Feedants design.

require('dotenv').config();
const mongoose = require('mongoose');
const Competition = require('./models/Competition');
const User = require('./models/User');
const Registration = require('./models/Registration');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected. Clearing old data...');

  await Competition.deleteMany({});
  await User.deleteMany({});
  await Registration.deleteMany({});

  // Create a couple of fake users to test with
  const users = await User.insertMany([
    { name: 'Test User 1', email: 'user1@test.com' },
    { name: 'Test User 2', email: 'user2@test.com' },
  ]);

  console.log('Users created:');
  users.forEach((u) => console.log(`  ${u.name}: ${u._id}`));

  // Dates set relative to "now" so the countdown/phases are always meaningful
  // whenever you run this script, instead of being hardcoded to a fixed past date.
  const now = Date.now();
  const DAY = 24 * 60 * 60 * 1000;

  const competition = await Competition.create({
    title: 'Feedants Classical Dance',
    tags: ['Dance', 'Multi-Win'],
    category: 'Dance',
    prizePool: 1500,
    entryFee: 99,
    maxSpots: 20,
    bookedSpots: 1, // matches "1 / 20 Booked" in the design
    judge: {
      name: 'Manju Dubey',
      title: 'Professional Kathak Dancer',
      experience: '12+ Years of Experience',
      photoUrl: 'https://placehold.co/200x200',
      introVideoUrl: 'https://example.com/intro.mp4',
    },
    registrationDeadline: new Date(now + 1.27 * DAY), // ~1d 6h from now, matches countdown
    submissionStart: new Date(now + 2 * DAY),
    submissionEnd: new Date(now + 20 * DAY),
    resultDate: new Date(now + 25 * DAY),
    aboutText:
      'This is an online classical dance competition open for all age groups. Participate from anywhere and showcase your talent. Express your passion through traditional dance.',
    judgingParameters: 'Technique, expression, costume, and choreography originality.',
    rulesAndEligibility: 'Open to all ages. One entry per participant. Video must be under 3 minutes.',
    rewards: [
      { position: '1st Winner', amount: 550 },
      { position: '2nd Winner', amount: 300 },
      { position: '3rd Winner', amount: 240 },
      { position: '4th Winner', amount: 200 },
      { position: '5th Winner', amount: 130 },
      { position: '6th Winner', amount: 80 },
    ],
    previousWinners: [
      { name: 'Riya Shah', position: '1st Winner', photoUrl: 'https://placehold.co/150', videoUrl: '' },
      { name: 'Aarav Mehta', position: '1st Winner', photoUrl: 'https://placehold.co/150', videoUrl: '' },
      { name: 'Neha Verma', position: '2nd Winner', photoUrl: 'https://placehold.co/150', videoUrl: '' },
      { name: 'Ishita Chopra', position: '3rd Winner', photoUrl: 'https://placehold.co/150', videoUrl: '' },
    ],
    status: 'open',
  });

  console.log('Competition created:', competition._id.toString());

  // Register user 1 so you can test the "already registered" + submission flow immediately
  await Registration.create({
    competitionId: competition._id,
    userId: users[0]._id,
    paymentStatus: 'paid',
  });

  console.log('\nDone. Use these values to test:');
  console.log('COMPETITION_ID =', competition._id.toString());
  console.log('REGISTERED_USER_ID (x-user-id) =', users[0]._id.toString());
  console.log('UNREGISTERED_USER_ID (x-user-id) =', users[1]._id.toString());

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});