// Simplified auth for the scope of this assignment.
// In production this would verify a JWT and attach the real user.
// Here, the frontend just sends an x-user-id header (a Mongo ObjectId
// string from a user we create in the seed script).

module.exports = function fakeAuth(req, res, next) {
  const userId = req.header('x-user-id');
  req.userId = userId || null;
  next();
};