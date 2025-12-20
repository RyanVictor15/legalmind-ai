// server/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  
  isPro: { type: Boolean, default: false },
  isAdmin: { type: Boolean, default: false },
  usageCount: { type: Number, default: 0 },
  
  // --- CAMPOS DE RECUPERAÇÃO ---
  resetPasswordToken: String,
  resetPasswordExpire: Date,

  // --- ITEM 4.3: CAMPOS 2FA (NOVO) ---
  twoFactorCode: String,
  twoFactorExpires: Date,
  // ----------------------------------

}, {
  timestamps: true,
});

userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

module.exports = mongoose.model('User', userSchema);