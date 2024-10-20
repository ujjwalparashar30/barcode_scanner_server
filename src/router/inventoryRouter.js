const express = require('express');
const inventoryController = require('../controllers/inventoryController');
const passport = require("passport");
const router = express.Router();

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        res.locals.currUser = req.user; // Set the current user to res.locals if authenticated
        return next();
    } else {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
    }
}

// Define the route and attach the controller function
router.post("/", ensureAuthenticated, inventoryController.addItemToInventory);
router.post('/remove',ensureAuthenticated, inventoryController.removeItemFromInventory);   // Route for removing items from inventory

module.exports = router;