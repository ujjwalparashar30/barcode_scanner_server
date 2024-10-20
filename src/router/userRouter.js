const express = require('express');
const userController = require('../controllers/userController');

const router = express.Router();

// Register route
router.post('/register', userController.registerUser);

// Login route
router.post('/login', userController.loginUser);

// Logout route
router.get('/logout', userController.logoutUser);

// Profile route
router.get('/profile', userController.getProfile);

module.exports = router;
