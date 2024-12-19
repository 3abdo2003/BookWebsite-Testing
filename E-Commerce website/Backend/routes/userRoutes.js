// backend/routes/userRoutes.js
const express = require('express');
const userController = require('../controllers/userController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();
// Public Routes
router.post('/register', userController.registerUser);   
router.post('/login', userController.loginUser);     
// Customer Routes 
router.get('/profile', protect, userController.getUserProfile);  

router.get('/check-admin', protect, (req, res) => {
  try {
    const isAdmin = req.user && req.user.role === 'admin'; // Check user's role
    res.status(200).json({ isAdmin });
  } catch (error) {
    res.status(500).json({ message: 'Failed to check admin status', error: error.message });
  }
});

  

module.exports = router;

