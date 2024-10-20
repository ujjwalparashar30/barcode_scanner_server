const User = require('../../modals/userSchema');
const passport = require("passport");
// Register a new user
exports.registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'Username already in use.' });
    }

    const newUser = new User({
      username,
      email,
      password,
    });

    await newUser.save();
    res.status(201).json(newUser);
  } catch (err) {
    res.status(500).json({ error: 'User registration failed.' });
  }
};

// Login user
exports.loginUser = (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/api/v1/profile',
    failureRedirect: '/api/v1/login',
    failureFlash: true,
  })(req, res, next);
};

// Logout user
exports.logoutUser = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect('/');
  });
};

// Get profile
exports.getProfile = (req, res) => {
  if (req.isAuthenticated()) {
    res.json(req.user);
  } else {
    res.status(401).json({ error: 'You are not authenticated.' });
  }
};
