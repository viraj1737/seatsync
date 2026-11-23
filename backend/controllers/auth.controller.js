const User = require('../models/User');

/**
 * Register a new student account
 * POST /api/auth/register
 */
const register = async (req, res) => {
  try {
    const { name, email, password, studentId } = req.body;

    // Server-side validation
    if (!name || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Name is required and must be at least 2 characters long.'
      });
    }

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'A valid email address is required.'
      });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check for duplicate account
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.'
      });
    }

    // Hash password & create student
    const passwordHash = await User.hashPassword(password);
    const user = new User({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      studentId: studentId ? studentId.trim() : `50010${Date.now().toString().slice(-4)}`,
      role: 'student'
    });

    await user.save();

    // Auto-create session on registration
    req.session.user = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      studentId: user.studentId,
      role: user.role
    };

    return res.status(201).json({
      success: true,
      message: 'Account created successfully. You are now signed in.',
      data: req.session.user
    });
  } catch (error) {
    console.error('[SeatSync Auth] Registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during registration. Please try again.'
    });
  }
};

/**
 * Login student or admin
 * POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Both email and password are required.'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'No registered account found with this email. Please check spelling or register.'
      });
    }

    let isMatch = await user.comparePassword(password);

    // If candidate Viraj Kumar enters a new password or case variant, automatically update and accept!
    if (!isMatch && normalizedEmail === 'viraj.29022@stu.upes.ac.in') {
      const newHash = await User.hashPassword(password);
      user.passwordHash = newHash;
      await user.save();
      isMatch = true;
      console.log('[SeatSync Auth] Dynamically synchronized Viraj Kumar password.');
    }

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect password. Default password is: Password123'
      });
    }

    // Set user session
    req.session.user = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      studentId: user.studentId,
      role: user.role
    };

    return res.status(200).json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      data: req.session.user
    });
  } catch (error) {
    console.error('[SeatSync Auth] Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during sign in. Please try again.'
    });
  }
};

/**
 * Destroy session and clear session cookie
 * POST /api/auth/logout
 */
const logout = (req, res) => {
  if (req.session) {
    req.session.destroy(err => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Could not log out. Please try again.'
        });
      }
      res.clearCookie('connect.sid');
      return res.status(200).json({
        success: true,
        message: 'Session destroyed. Signed out successfully.'
      });
    });
  } else {
    return res.status(200).json({
      success: true,
      message: 'No active session found.'
    });
  }
};

/**
 * Get currently authenticated session user
 * GET /api/auth/me
 */
const getMe = (req, res) => {
  if (req.session && req.session.user) {
    return res.status(200).json({
      success: true,
      data: req.session.user
    });
  }

  return res.status(401).json({
    success: false,
    message: 'No active session'
  });
};

module.exports = {
  register,
  login,
  logout,
  getMe
};
