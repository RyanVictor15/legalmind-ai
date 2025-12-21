const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const Document = require('../models/Document');
const sendEmail = require('../utils/sendEmail');

// Generate Token with Version (Enforces Session Invalidating)
const generateToken = (id, tokenVersion) => {
  return jwt.sign({ id, tokenVersion }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// 1. REGISTER
const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ status: 'error', message: 'All fields are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ status: 'error', message: 'Password must be at least 6 characters.' });
    }
    
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ status: 'error', message: 'Email already registered.' });
    }

    const user = await User.create({ firstName, lastName, email, password });

    if (user) {
      res.status(201).json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        token: generateToken(user._id, user.tokenVersion),
        isPro: user.isPro,
        twoFactorEnabled: user.twoFactorEnabled
      });
    } else {
      res.status(400).json({ status: 'error', message: 'Invalid user data.' });
    }
  } catch (error) {
    console.error('Register Error:', error);
    res.status(500).json({ status: 'error', message: 'Server error.' });
  }
};

// 2. LOGIN (Increments version and invalidates old sessions)
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      
      // 2FA Flow
      if (user.twoFactorEnabled) {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        user.twoFactorCode = crypto.createHash('sha256').update(code).digest('hex');
        user.twoFactorExpires = Date.now() + 10 * 60 * 1000; // 10 mins
        
        await user.save({ validateBeforeSave: false });

        const message = `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Your Security Code</h2>
            <h1 style="color: #2563eb;">${code}</h1>
          </div>
        `;

        try {
          await sendEmail({
            email: user.email,
            subject: 'Access Code - LegalMind AI',
            message,
          });

          return res.json({ 
            requires2FA: true, 
            email: user.email,
            message: 'Security code sent to email.' 
          });

        } catch (emailError) {
          user.twoFactorCode = undefined;
          user.twoFactorExpires = undefined;
          await user.save({ validateBeforeSave: false });
          return res.status(500).json({ status: 'error', message: 'Error sending 2FA code.' });
        }
      }

      // Direct Login -> Invalidate old sessions
      user.tokenVersion = (user.tokenVersion || 0) + 1;
      await user.save();

      res.json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        token: generateToken(user._id, user.tokenVersion),
        isPro: user.isPro,
        isAdmin: user.isAdmin,
        twoFactorEnabled: user.twoFactorEnabled,
        usageCount: user.usageCount
      });

    } else {
      res.status(401).json({ status: 'error', message: 'Invalid email or password.' });
    }
  } catch (error) {
     console.error('Login Error:', error);
     res.status(500).json({ status: 'error', message: 'Server error.' });
  }
};

// 2.5 VERIFY 2FA
const verifyTwoFactor = async (req, res) => {
  const { email, code } = req.body;

  try {
    const hashedCode = crypto.createHash('sha256').update(code).digest('hex');

    const user = await User.findOne({
      email,
      twoFactorCode: hashedCode,
      twoFactorExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ status: 'error', message: 'Invalid or expired code.' });
    }

    // Success -> Clear code & Invalidate old sessions
    user.twoFactorCode = undefined;
    user.twoFactorExpires = undefined;
    
    user.tokenVersion = (user.tokenVersion || 0) + 1;
    await user.save({ validateBeforeSave: false });

    res.json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      token: generateToken(user._id, user.tokenVersion),
      isPro: user.isPro,
      isAdmin: user.isAdmin,
      twoFactorEnabled: user.twoFactorEnabled,
      usageCount: user.usageCount
    });

  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Verification error.' });
  }
};

// 3. GET USER PROFILE
const getUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    res.json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      isPro: user.isPro,
      isAdmin: user.isAdmin,
      twoFactorEnabled: user.twoFactorEnabled,
      usageCount: user.usageCount,
      createdAt: user.createdAt
    });
  } else {
    res.status(404).json({ status: 'error', message: 'User not found.' });
  }
};

// 4. UPDATE USER PROFILE
const updateUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.firstName = req.body.firstName || user.firstName;
    user.lastName = req.body.lastName || user.lastName;

    if (req.body.twoFactorEnabled !== undefined) {
      user.twoFactorEnabled = req.body.twoFactorEnabled;
    }

    if (req.body.password) {
      if (req.body.password.length < 6) {
         return res.status(400).json({ status: 'error', message: 'Password must be at least 6 characters.' });
      }
      user.password = req.body.password;
      // Password changed? Invalidate all other sessions!
      user.tokenVersion = (user.tokenVersion || 0) + 1;
    }
    
    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      isPro: updatedUser.isPro,
      twoFactorEnabled: updatedUser.twoFactorEnabled,
      token: generateToken(updatedUser._id, updatedUser.tokenVersion),
    });
  } else {
    res.status(404).json({ status: 'error', message: 'User not found.' });
  }
};

// 5. FORGOT PASSWORD
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ status: 'error', message: 'Email not found.' });
    
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 mins
    
    await user.save({ validateBeforeSave: false });
    
    // Security Fix: Use env variable for client URL
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const resetUrl = `${clientUrl}/reset-password/${resetToken}`;
    
    await sendEmail({ 
      email: user.email, 
      subject: 'Password Reset Request', 
      message: `Click here to reset your password: ${resetUrl}` 
    });
    
    res.status(200).json({ status: 'success', message: 'Email sent!' });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    res.status(500).json({ status: 'error', message: 'Server error.' });
  }
};

// 6. RESET PASSWORD
const resetPassword = async (req, res) => {
  const resetPasswordToken = crypto.createHash('sha256').update(req.params.resetToken).digest('hex');
  
  try {
    const user = await User.findOne({ 
      resetPasswordToken, 
      resetPasswordExpire: { $gt: Date.now() } 
    });

    if (!user) return res.status(400).json({ status: 'error', message: 'Invalid or expired token.' });

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    
    // Invalidate sessions on password reset
    user.tokenVersion = (user.tokenVersion || 0) + 1;
    
    await user.save();
    res.status(200).json({ status: 'success', message: 'Password updated!' });
  } catch (error) { 
    res.status(500).json({ status: 'error', message: 'Reset password error.' }); 
  }
};

// 7. UPGRADE TO PRO
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

// 8. DELETE ACCOUNT
const deleteAccount = async (req, res) => {
  try {
    const userId = req.user._id;
    await Document.deleteMany({ userId: userId });
    await User.findByIdAndDelete(userId);
    res.json({ status: 'success', message: 'Account deleted.' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Delete account error.' });
  }
};

module.exports = { 
  registerUser, loginUser, verifyTwoFactor, getUserProfile, 
  updateUserProfile, upgradeToPro, forgotPassword, resetPassword, deleteAccount
};