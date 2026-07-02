const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { protect, adminOnly } = require('../middleware/auth');

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role, name: user.name }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Authenticate admin or user & get token
// @route   POST /api/auth/admin/login
// @access  Public
router.post('/admin/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    res.json({
      token: generateToken(user),
      admin: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get currently authenticated user details
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
  res.json({
    admin: {
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    },
  });
});

// @desc    Get all users list with database product counts (Admin only)
// @route   GET /api/auth/users
// @access  Private/Admin
router.get('/users', protect, adminOnly, async (req, res) => {
  try {
    const users = await User.findAll();
    const { getDbForUser } = require('../config/db');

    const usersWithStats = users.map((u) => {
      let productCount = 0;
      try {
        const userDb = getDbForUser(u.id);
        const row = userDb.prepare('SELECT COUNT(*) as count FROM products').get();
        productCount = row.count;
      } catch (err) {
        // Fallback if table doesn't exist
      }
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        password: u.password,
        role: u.role,
        createdAt: u.createdAt,
        productCount
      };
    });

    res.json(usersWithStats);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Change any user's password (Admin only)
// @route   PUT /api/auth/users/:id/password
// @access  Private/Admin
router.put('/users/:id/password', protect, adminOnly, async (req, res) => {
  const { newPassword } = req.body;
  try {
    if (!newPassword || !newPassword.trim()) {
      return res.status(400).json({ message: 'New password is required.' });
    }

    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    await User.resetPassword(req.params.id, hashedPassword);
    res.json({ message: 'User password updated successfully!' });
  } catch (error) {
    console.error('Error changing user password:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Delete any user's account and their isolated database (Admin only)
// @route   DELETE /api/auth/users/:id
// @access  Private/Admin
router.delete('/users/:id', protect, adminOnly, async (req, res) => {
  try {
    const userId = req.params.id;

    if (userId === req.user.id.toString()) {
      return res.status(400).json({ message: 'You cannot delete your own admin account.' });
    }

    const { closeDbForUser } = require('../config/db');
    const fs = require('fs');
    const path = require('path');

    // Close SQLite connection pool for this user
    closeDbForUser(userId);

    // Unlink SQLite files if they exist
    const dbPath = path.join(__dirname, `../data/medishop_user_${userId}.db`);
    const shmPath = `${dbPath}-shm`;
    const walPath = `${dbPath}-wal`;

    try {
      if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);
      if (fs.existsSync(shmPath)) fs.unlinkSync(shmPath);
      if (fs.existsSync(walPath)) fs.unlinkSync(walPath);
    } catch (e) {
      console.error(`Error unlinking database files for User ${userId}:`, e);
    }

    const deletedUser = await User.delete(userId);
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.json({ message: `Account for user "${deletedUser.name}" has been successfully deleted.` });
  } catch (error) {
    console.error('Error deleting user account:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Register a new account (forces admin only if email is admin@medishop.local)
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email.' });
    }

    // Only admin@medishop.local gets the 'admin' role, others get 'user' role
    const isMainAdmin = email.toLowerCase().trim() === 'admin@medishop.local';
    const role = isMainAdmin ? 'admin' : 'user';

    const user = await User.create({
      name,
      email,
      password,
      role
    });

    res.status(201).json({
      message: 'Account created successfully! You can now login.',
      admin: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error in registration:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Request password reset token (simulated email code)
// @route   POST /api/auth/forgot-password
// @access  Public
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ message: 'Email is required.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'No account found with this email.' });
    }

    // Generate random 6-digit verification code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Expire in 15 minutes
    const expiry = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    await User.saveResetToken(user.id, resetCode, expiry);

    // Return the code in the API response so the user can see it (since no email server)
    res.json({
      message: 'Password reset code generated.',
      simulatedCode: resetCode // returned for demo/development testing
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Reset password using verification code
// @route   POST /api/auth/reset-password
// @access  Public
router.post('/reset-password', async (req, res) => {
  const { email, token, newPassword } = req.body;

  try {
    if (!email || !token || !newPassword) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'No account found with this email.' });
    }

    if (!user.resetToken || user.resetToken !== token) {
      return res.status(400).json({ message: 'Invalid or incorrect reset code.' });
    }

    const now = new Date();
    const expiryDate = new Date(user.resetTokenExpiry);
    if (now > expiryDate) {
      return res.status(400).json({ message: 'Reset code has expired.' });
    }

    // Hash the password and save
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.resetPassword(user.id, hashedPassword);

    res.json({ message: 'Password reset successful! You can now login.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;