// Run this after seedConcurrencyTest.js with:
//   node testConcurrency.js <competitionId>
//
// Fires 5 registration requests to the SAME competition at the exact
// same time (Promise.all), when only 1 spot is left. Proves that the
// atomic findOneAndUpdate in registrationController.js prevents
// overbooking — exactly 1 should succeed, 4 should fail with
// "No spots left", even though all 5 requests hit the server
// simultaneously.

require('dotenv').config();
const mongoose = require('mongoose');
const axios = require('axios');
const User = require('./models/User');
const Competition = require('./models/Competition');

const API_BASE = `http://localhost:${process.env.PORT || 5000}/api`;

async function run() {
  const competitionId = process.argv[2];
  if (!competitionId) {
    console.error('Usage: node testConcurrency.js <competitionId>');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);

  const users = await User.find({ email: /concurrencytest/ });
  if (users.length < 2) {
    console.error('Run seedConcurrencyTest.js first to create test users.');
    process.exit(1);
  }

  console.log(`Firing ${users.length} simultaneous registration requests...`);
  console.log('(Only 1 spot is available — expect exactly 1 success, rest should fail)\n');

  const requests = users.map((user) =>
    axios
      .post(
        `${API_BASE}/competitions/${competitionId}/register`,
        {},
        { headers: { 'x-user-id': user._id.toString() } }
      )
      .then((res) => ({ user: user.name, status: 'SUCCESS', data: res.data }))
      .catch((err) => ({
        user: user.name,
        status: 'FAILED',
        message: err.response?.data?.message || err.message,
      }))
  );

  const results = await Promise.all(requests);

  results.forEach((r) => {
    if (r.status === 'SUCCESS') {
      console.log(`✅ ${r.user}: SUCCESS — spotsLeft now ${r.data.spotsLeft}`);
    } else {
      console.log(`❌ ${r.user}: FAILED — ${r.message}`);
    }
  });

  const successCount = results.filter((r) => r.status === 'SUCCESS').length;
  console.log(`\n${successCount} out of ${users.length} requests succeeded.`);

  const finalComp = await Competition.findById(competitionId).lean();
  console.log(
    `Final state: ${finalComp.bookedSpots} / ${finalComp.maxSpots} booked (should be exactly ${finalComp.maxSpots}, never over).`
  );

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});