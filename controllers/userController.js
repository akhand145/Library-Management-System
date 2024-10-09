const User = require('../models/user');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// User validation 
const validateRegister = [
    body('name')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Name must be between 2 and 50 characters'),
    body('email')
      .trim()
      .isEmail()
      .withMessage('Please provide a valid email address'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
];
  
const register = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ status: 'failed', errors: errors.array() });
    }

    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ status: 'failed', msg: 'Please provide name, email and password!' });
    }

    // Check if user already exists
    let existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ status: 'failed', msg: 'User already exists with this email!' });
    }

    const user = new User({ name, email, password });
    // password hashing to encoded the password is already in user model
    await user.save();
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    return res.status(201).json({ status: 'success', msg: 'User registered successfully!', user: { id: user._id, name: user.name, email: user.email }, token });
  } catch (error) {
    return res.status(500).json({ status: 'failed', msg: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ status: 'failed', msg: 'Please provide email and password!' });
    }

    const user = await User.findOne({ email });
    // comparing of password to match the correct the user is already in user model 
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ status: 'failed', msg: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.status(200).json({ status: 'success', msg: 'Login successfully login!', user: { id: user._id, name: user.name, email: user.email }, token });
  } catch (error) {
    res.status(500).json({ status: 'failed', msg: error.message });
  }
};
 
const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    const users = await User.find().limit(limit * 1).skip((page - 1) * limit).select('-password');

    const count = await User.countDocuments();
    const totalPages = Math.ceil(count / limit);

    if (users.length === 0) {
        return res.status(404).json({ status: 'failed', msg: 'No users found!', data: [] });
    }

    return res.status(200).json({ status: "success", currentPage: page, totalPages: totalPages, totalCount: count, data: users });
  } catch (error) {
    res.status(500).json({ status: 'failed', msg: error.message });
  }
};

const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select('-password');
    if (!user) {
        return res.status(404).json({ status: 'failed', msg: 'User not found!' });
    }
    
    res.status(200).json({ status: 'success', data: user });
  } catch (error) {
    res.status(500).json({ status: 'failed', msg: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ status: 'failed', errors: errors.array() });
    }

    const user = await User.findById(id).select('-password');
    if (!user) {
        return res.status(404).json({ status: 'failed', msg: 'User not found!' });
    }

    const { name, password } = req.body;
    const updatedData = {};

    if (name) updatedData.name = name;
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updatedData.password = hashedPassword;
    }

    const updateUser = await User.findByIdAndUpdate(id, updatedData, { new: true });
    if (!updateUser) {
        return res.status(400).json({ status: 'failed', msg: 'User not updated!' });
    }
    res.status(200).json({ status: 'success', msg: 'User data updated successfully!', data: updateUser });
  } catch (error) {
    res.status(500).json({ status: 'failed', msg: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select('-password');
    if (!user) {
        return res.status(404).json({ status: 'failed', msg: 'User not found!' });
    }

    const deleteUser = await User.findByIdAndDelete(id);
    if (!deleteUser) {
        return res.status(400).json({ status: 'failed', msg: 'User not deleted!' });
    }
    
    res.status(200).json({ status: 'success', msg: 'User deleted successfully!' });
  } catch (error) {
    res.status(500).json({ status: 'failed', msg: error.message });
  }
};

module.exports = {
    validateRegister,
    register,
    login,
    getAllUsers,
    getUser,
    updateUser,
    deleteUser,
}