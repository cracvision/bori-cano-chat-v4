/**
 * Kitchen Module Middleware
 */

function requireApiKey(req, res, next) {
  const apiKey = req.headers['x-api-key'];
  const expectedKey = process.env.API_KEY;

  if (!expectedKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  if (!apiKey || apiKey !== expectedKey) {
    return res.status(401).json({ error: 'Invalid or missing API key' });
  }

  next();
}

function requireKitchenAccess(req, res, next) {
  // Assuming user object is populated by existing auth middleware
  const user = req.user;
  
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const allowedRoles = ['KITCHEN', 'ADMIN'];
  if (!allowedRoles.includes(user.role)) {
    return res.status(403).json({ error: 'Kitchen access required' });
  }

  next();
}

module.exports = {
  requireApiKey,
  requireKitchenAccess
};
