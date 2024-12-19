// backend/middleware/authMiddleware
const jwt = require('jsonwebtoken');
const Users = require('../models/Users'); 

const protect = async (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; 

  console.log('Token:', token); // Log the token to check if it's being passed correctly

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await Users.findById(decoded.id);
    if (!req.user) {
      return res.status(401).json({ message: 'User not found' });
    }
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token is not valid' });
  }
};


const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access forbidden: Admins only' });
  }
};


const customerOnly = (req, res, next) => {
  if (req.user && req.user.role === 'customer') {
    next();
  } else {
    res.status(403).json({ message: 'Access forbidden: Customers only' });
  }
};

module.exports = { protect, adminOnly, customerOnly };
