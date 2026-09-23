# Feedants Classical Dance — Competition Details Screen

A functional full-stack implementation of the Competition Details screen for the Feedants Full Stack Development Internship technical assignment.

Built with **React Native (Expo)**, **Node.js + Express**, and **MongoDB**.

---

## What this covers

The screen is fully data-driven — nothing about competition details, spots remaining, dates, or the user's registration/submission state is hardcoded on the frontend. Everything is served from MongoDB through the backend API and re-derived on every request based on the current time and the current user.

Specifically implemented:

- Dynamic competition data (title, tags, prize pool, entry fee, judge, dates, rewards, previous winners, about/judging/rules text)
- Live spot availability (`x / y booked`, `only N spots left`, "Registration Full" once maxed out)
- A registration lifecycle derived server-side from the current time: `registration_open → awaiting_submission_window → submission_open → awaiting_results → results_declared`
- User-specific state: whether the current user is registered, whether they can register, whether they can submit, whether they've already submitted
- **Atomic, race-condition-safe spot booking** — verified with a standalone concurrency test (see below)
- A single primary action button that changes label/behavior based on the live state (Register / Registered / Upload Submission / Submission Uploaded / Registration Full / Registration Closed / etc.)

---

## Tech stack

| Layer | Tech |
|---|---|
| Frontend | React Native via Expo (Expo Router) |
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| HTTP client | Axios |

---

## Project structure

```
feedants-assignment/
  backend/
    models/           # Mongoose schemas: Competition, Registration, User
    controllers/       # Route handlers: competition reads, registration/submission logic
    routes/             # Express routers
    middleware/        # Simplified auth (see Assumptions)
    utils/               # Server-side state derivation logic
    server.js
    seed.js                    # Populates the main demo competition
    seedConcurrencyTest.js     # Sets up a competition with 1 spot left, for the race-condition demo
    testConcurrency.js         # Fires 5 simultaneous registration requests to prove atomicity
  frontend/
    src/
      app/index.js      # Main (and only) screen — Expo Router entry point
      components/        # HeaderCard, JudgeCard, CountdownTimer, ImportantDatesGrid,
                          # PreviousWinnersCarousel, TabbedInfo, RewardsList, ActionButton
      api/                    # Axios client wrapping the backend endpoints
      constants/          # theme.js (design tokens), config.js (API base URL, current user ID)
```

---

## How to run it

### 1. Backend

```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:

```
MONGO_URI=mongodb://localhost:27017/feedants
PORT=5000
```

(Works with a local MongoDB instance, or swap in a MongoDB Atlas connection string.)

Seed the database with the main demo competition:

```bash
node seed.js
```

This prints a `COMPETITION_ID` and two test user IDs — one already registered, one not. Copy these; you'll need the competition ID for the frontend config.

Start the server:

```bash
npx nodemon server.js
```

Should print `MongoDB connected` and `Server running on port 5000`.

### 2. Frontend

```bash
cd frontend
npm install
```

Edit `src/constants/config.js`:

```js
export const API_BASE_URL = 'http://<YOUR_PC_LOCAL_IP>:5000/api';
export const CURRENT_USER_ID = '<REGISTERED_USER_ID from seed.js output>';
```

Find your PC's local IP (needed so a phone on the same Wi-Fi can reach your backend) via `ipconfig` (Windows) or the IP shown when you run `npx expo start`.

Also update `COMPETITION_ID` in `src/app/index.js` to match the ID printed by `seed.js`.

Start Expo:

```bash
npx expo start
```

Scan the QR code with the Expo Go app (phone and PC must be on the same Wi-Fi network).

### 3. Concurrency / race-condition demo

This is a standalone proof that the spot-booking logic is safe under concurrent load — it's not part of the UI flow, just a backend verification script.

```bash
cd backend
node seedConcurrencyTest.js
```

This creates a separate test competition with only **1 spot left** and 5 test users. Copy the printed competition ID, then:

```bash
node testConcurrency.js <competitionId>
```

This fires all 5 registration requests **simultaneously** (`Promise.all`) against the same competition. Expected (and actual, verified) result: exactly 1 request succeeds, the other 4 fail with "No spots left", and the final booked count never exceeds `maxSpots` — even though every request hit the server at the same instant.

---

## Key technical decisions

**Atomic spot booking instead of counting registrations.** `bookedSpots` is stored as a counter directly on the `Competition` document rather than computed by counting `Registration` documents on every read. Counting on every page load doesn't scale well to thousands of concurrent users hitting the same competition. The counter is only ever mutated through a single atomic `findOneAndUpdate` with a conditional filter (`bookedSpots < maxSpots`), so MongoDB itself guarantees that two simultaneous requests can't both succeed when only one spot remains — there's no read-then-write gap for a race condition to exploit. This was verified explicitly with the concurrency test script above rather than just assumed.

**State is derived, never stored.** Fields like `phase`, `spotsLeft`, `isRegistered`, `canRegister`, and `canSubmit` are computed fresh on every `GET` request by comparing the competition's stored dates against the current server time, rather than being pre-computed and cached in the database. This avoids an entire class of bugs where stale state would need a background job or cron to stay in sync with the actual date/time — the server is always right, regardless of when it was last "updated."

**Rollback on partial failure.** If the atomic spot increment succeeds but the following `Registration.create()` call fails for any reason (e.g. a rare race on the unique index), the spot increment is rolled back with a compensating decrement. This was chosen over a full MongoDB multi-document transaction for simplicity within the assignment's scope — a production system with more write paths touching these two collections would likely justify `session.withTransaction()` instead.

**Simplified authentication.** Rather than building a full JWT-based signup/login flow (out of scope for what this assignment is evaluating), the frontend sends a `x-user-id` header identifying the "current user," and a small middleware reads it into `req.userId`. This is clearly not production-appropriate and is called out explicitly here and in code comments.

---

## Assumptions

- Payment integration (Razorpay, as shown in the design) is out of scope — registrations are created with `paymentStatus: 'pending'` and would be flipped to `'paid'` by a payment webhook in a real implementation.
- File/video upload for submissions is simulated with a placeholder URL rather than an actual upload pipeline (S3/Cloudinary etc.), since the assignment's focus is on state/business logic rather than file handling infrastructure.
- Only one competition is modeled end-to-end (matching the single screen in the design); the schema is written to generalize to a list of competitions without changes.
- Images (judge photo, winner photos) use placeholder URLs since no real assets were provided.

## Trade-offs considered

- **Transactions vs. atomic update + rollback**: considered using a MongoDB session/transaction for the register flow, but a single atomic conditional update covers the actual race condition (overbooking) without the added complexity and latency of a full transaction, given only two documents are touched.
- **Storing `bookedSpots` vs. counting live**: a live count is simpler and always trivially consistent, but doesn't scale to high read volume on a popular competition page. Chose the counter for scalability; the trade-off is it must be kept correct through disciplined atomic writes (see above) rather than being automatically consistent by construction.

## What I'd improve for production

- Real authentication (JWT) instead of a header-based user ID
- Real Razorpay integration with webhook-driven payment status updates
- Actual file/video upload (e.g. pre-signed S3 URLs) for submissions
- Redis caching for hot competition reads at scale, with cache invalidation on registration
- A WebSocket or polling-based live update for "spots left" so users watching the screen see it change in real time without a manual refresh
- Rate limiting on the registration endpoint to blunt bot/spam registration attempts
- Proper input validation (e.g. with Zod or Joi) on all request bodies
- Automated tests (unit tests for the state-derivation logic, integration tests for the registration race condition, replacing the current manual concurrency script)
