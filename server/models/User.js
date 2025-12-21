const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  
  // Status do Sistema
  isAdmin: { type: Boolean, default: false },
  
  // Dados de Assinatura (Stripe)
  isPro: { type: Boolean, default: false },
  stripeCustomerId: { type: String },
  subscriptionId: { type: String },
  subscriptionStatus: { type: String, default: 'free' }, // active, past_due, canceled, free
  billingCycleEnd: { type: Date },

  // Segurança
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  twoFactorEnabled: { type: Boolean, default: false },
  twoFactorCode: String,
  twoFactorExpires: Date,
  tokenVersion: { type: Number, default: 0 },

  createdAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);