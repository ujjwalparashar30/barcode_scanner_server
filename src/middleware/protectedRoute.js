const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  console.log("hit");
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (typeof decoded === 'string') {
      return res.status(400).json({ error: "Invalid token format." });
    }

    req.user = decoded; // Assign decoded token to req.user
    next();
  } catch (err) {
    return res.status(400).json({ error: "Invalid token." });
  }
};

module.exports = authMiddleware;
