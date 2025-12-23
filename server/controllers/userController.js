const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { z } = require('zod'); // Import Zod
const User = require('../models/User');
const Document = require('../models/Document');
const sendEmail = require('../utils/sendEmail');

// --- ZOD SCHEMAS ---
const registerSchema = z.object({
  firstName: z.string().min(2, "First name too short"),
  lastName: z.string().min(2, "Last name too short"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// --- HELPERS ---
const generateToken = (id, tokenVersion) => {
  return jwt.sign({ id, tokenVersion }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// 1. REGISTER
const registerUser = async (req, res) => {
  try {
    // 1. Validation (Security Hardening)
    const { firstName, lastName, email, password } = registerSchema.parse(req.body);

    // 2. Check Duplicates
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ status: 'error', message: 'Email already registered.' });
    }

    // 3. Create User
    const user = await User.create({ firstName, lastName, email, password });

    if (user) {
      res.status(201).json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        token: generateToken(user._id, user.tokenVersion),
        isPro: user.isPro
      });
    } else {
      res.status(400).json({ status: 'error', message: 'Invalid user data.' });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ status: 'error', message: error.errors[0].message });
    }
    res.status(500).json({ status: 'error', message: 'Server error during registration.' });
  }
};

// 2. LOGIN
const loginUser = async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      
      // 2FA Check
      if (user.twoFactorEnabled) {
        // Generate 6-digit code
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        
        user.twoFactorCode = crypto.createHash('sha256').update(code).digest('hex');
        user.twoFactorExpires = Date.now() + 10 * 60 * 1000; // 10 mins
        await user.save();

        try {
          await sendEmail({
            email: user.email,
            subject: 'LegalMind AI - Your Login Code',
            message: `<h1>${code}</h1><p>This code expires in 10 minutes.</p>`
          });
          
          return res.status(200).json({ 
            status: 'success', 
            requires2FA: true, 
            message: '2FA Code sent to email.' 
          });
        } catch (emailError) {
          user.twoFactorCode = undefined;
          user.twoFactorExpires = undefined;
          await user.save();
          return res.status(500).json({ status: 'error', message: 'Failed to send 2FA email.' });
        }
      }

      // Standard Login
      res.json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isAdmin: user.isAdmin,
        isPro: user.isPro,
        token: generateToken(user._id, user.tokenVersion),
        twoFactorEnabled: user.twoFactorEnabled
      });
    } else {
      res.status(401).json({ status: 'error', message: 'Invalid email or password.' });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ status: 'error', message: error.errors[0].message });
    }
    res.status(500).json({ status: 'error', message: 'Server error during login.' });
  }
};

// 3. GET PROFILE
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      res.json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isAdmin: user.isAdmin,
        isPro: user.isPro,
        twoFactorEnabled: user.twoFactorEnabled
      });
    } else {
      res.status(404).json({ status: 'error', message: 'User not found.' });
    }
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Fetch profile error.' });
  }
};

// 4. UPDATE PROFILE
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.firstName = req.body.firstName || user.firstName;
      user.lastName = req.body.lastName || user.lastName;
      
      // Handle Password Change
      if (req.body.password) {
        if(req.body.password.length < 6) {
             return res.status(400).json({ status: 'error', message: 'Password too short.' });
        }
        user.password = req.body.password;
        // Invalidate previous tokens by incrementing version
        user.tokenVersion += 1; 
      }

      // Handle 2FA Toggle
      if (req.body.twoFactorEnabled !== undefined) {
        user.twoFactorEnabled = req.body.twoFactorEnabled;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        isAdmin: updatedUser.isAdmin,
        isPro: updatedUser.isPro,
        token: generateToken(updatedUser._id, updatedUser.tokenVersion), // Issue new token
        twoFactorEnabled: updatedUser.twoFactorEnabled
      });
    } else {
      res.status(404).json({ status: 'error', message: 'User not found.' });
    }
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Update profile error.' });
  }
};

// 5. VERIFY 2FA
const verifyTwoFactor = async (req, res) => {
  try {
    const { email, code } = req.body;
    
    // Hash the received code to compare with DB
    const hashedCode = crypto.createHash('sha256').update(code).digest('hex');

    const user = await User.findOne({
      email,
      twoFactorCode: hashedCode,
      twoFactorExpires: { $gt: Date.now() } // Check expiry
    });

    if (!user) {
      return res.status(400).json({ status: 'error', message: 'Invalid or expired code.' });
    }

    // Clear 2FA fields
    user.twoFactorCode = undefined;
    user.twoFactorExpires = undefined;
    await user.save();

    res.json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      isAdmin: user.isAdmin,
      isPro: user.isPro,
      token: generateToken(user._id, user.tokenVersion),
      twoFactorEnabled: user.twoFactorEnabled
    });

  } catch (error) {
    res.status(500).json({ status: 'error', message: '2FA Verification error.' });
  }
};

// 6. FORGOT PASSWORD
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      // Security: Don't reveal user existence
      return res.status(200).json({ status: 'success', message: 'If email exists, reset link sent.' });
    }

    // Generate Reset Token
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 mins

    await user.save();

    // Frontend URL
    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

    const message = `
      <h1>Password Reset Request</h1>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}" clicktracking=off>${resetUrl}</a>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'LegalMind AI - Password Reset',
        message
      });
      res.status(200).json({ status: 'success', message: 'Email sent.' });
    } catch (err) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
      res.status(500).json({ status: 'error', message: 'Email could not be sent.' });
    }
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Server error.' });
  }
};

// 7. RESET PASSWORD
const resetPassword = async (req, res) => {
  try {
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.resetToken).digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ status: 'error', message: 'Invalid or expired token.' });
    }

    if(req.body.password.length < 6) {
        return res.status(400).json({ status: 'error', message: 'Password too short.' });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    user.tokenVersion += 1; // Invalidate all sessions

    await user.save();
    res.status(200).json({ status: 'success', message: 'Password updated!' });
  } catch (error) { 
    res.status(500).json({ status: 'error', message: 'Reset password error.' }); 
  }
};

// 8. UPGRADE TO PRO
const upgradeToPro = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      user.isPro = true;
      user.usageCount = 0;
      await user.save();
      
      res.json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        token: generateToken(user._id, user.tokenVersion),
        isPro: user.isPro,
        twoFactorEnabled: user.twoFactorEnabled
      });
    } else {
      res.status(404).json({ status: 'error', message: 'User not found.' });
    }
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Upgrade processing error.' });
  }
};

// 9. DELETE ACCOUNT
const deleteAccount = async (req, res) => {
  try {
    const userId = req.user._id;
    await Document.deleteMany({ userId: userId });
    await User.findByIdAndDelete(userId);
    
    res.json({ status: 'success', message: 'User and data deleted.' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Delete account error.' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  forgotPassword,
  resetPassword,
  upgradeToPro,
  verifyTwoFactor,
  deleteAccount
};