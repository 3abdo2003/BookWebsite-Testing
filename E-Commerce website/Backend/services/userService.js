const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/Users'); // Correct model path

exports.registerUser = async (userData) => {
    try {
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        throw new Error('User already exists');
      }
  
      
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);
  
      
      const newUser = new User({
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
      });
  
      
      return await newUser.save();
    } catch (error) {
      throw new Error(error.message);
    }
  };

  exports.loginUser = async (email, password) => {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error('Invalid credentials');
      }
  
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        throw new Error('Invalid credentials');
      }
  
      // Generate a token
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {expiresIn: '1h', });
  
      return { user, token }; 
    } catch (error) {
      throw new Error(error.message);
    }
  };

exports.getUserById = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  } catch (error) {
    throw new Error(error.message);
  }
};
