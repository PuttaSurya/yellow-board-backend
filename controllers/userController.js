const mongoose = require('mongoose');
const User = require('../models/User');


exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password -token');
    res.status(200).json(users);
  } catch (error) {
    console.error('GET_ALL_USERS_ERROR:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get User By ID
exports.getUserById = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid user ID format' });
  }

  try {
    const user = await User.findById(id).select('-password -token');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      id: user._id,
      fullName: user.fullName,
      mobile: user.mobile
    });
  } catch (error) {
    console.error('GET_USER_BY_ID_ERROR:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


