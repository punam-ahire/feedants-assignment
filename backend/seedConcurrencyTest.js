// Run this once with: node seedConcurrencyTest.js
// Creates a SEPARATE test competition with only 1 spot left,
// plus 5 fresh users, so we can prove the atomic registration
// logic prevents overbooking when many users race for the last spot.

require('dotenv').config();
const mongoose = require('mongoose');
const Competition = require('./models/Competition');
const User = require('./models/User');
const Registration = require('./models/Registration');

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected.');

  // Clean up any previous test run
  await Competition.deleteMany({ title: 'CONCURRENCY_TEST' });
  await User.deleteMany({ email: /concurrencytest/ });

  const now = Date.now();
  const DAY = 24 * 60 * 60 * 1000;

  const competition = await Competition.create({
    title: 'CONCURRENCY_TEST',
    tags: ['Test'],
    prizePool: 100,
    entryFee: 0,
    maxSpots: 5,
    bookedSpots: 4, // only 1 spot left on purpose
    judge: { name: 'Test Judge' },
    registrationDeadline: new Date(now + 1 * DAY),
    submissionStart: new Date(now + 2 * DAY),
    submissionEnd: new Date(now + 5 * DAY),
    resultDate: new Date(now + 6 * DAY),
    aboutText: 'Test competition for concurrency demo',
    rewards: [],
    previousWinners: [],
  });

  const users = await User.insertMany(
    Array.from({ length: 5 }).map((_, i) => ({
      name: `Concurrency Test User ${i + 1}`,
      email: `concurrencytest${i + 1}@test.com`,
    }))
  );

  console.log('\nTest competition created:', competition._id.toString());
  console.log('It has only 1 spot left (4/5 booked).');
  console.log('\n5 users created to race for that 1 spot:');
  users.forEach((u) => console.log(`  ${u.name}: ${u._id}`));

  console.log('\nNow run: node testConcurrency.js', competition._id.toString());

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});