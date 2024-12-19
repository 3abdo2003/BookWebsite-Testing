const UserService = require('../services/userService');

exports.registerUser = async (req, res) => {
  try {
    const user = await UserService.registerUser(req.body);
    res.status(200).json({ message: 'User registered successfully', user });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { user, token } = await UserService.loginUser(email, password);
    res.json({ message: 'Login successful', user, token });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


exports.getUserProfile = async (req, res) => {
  try {
    const user = await UserService.getUserById(req.user._id);
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

