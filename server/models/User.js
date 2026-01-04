const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // --- SEUS CAMPOS ORIGINAIS (MANTIDOS) ---
  organization: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Organization' 
  },
  organizationRole: {
    type: String,
    enum: ['owner', 'admin', 'editor', 'viewer'],
    default: 'owner' 
  },
  
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  
  // OAuth
  googleId: { type: String, unique: true, sparse: true },
  avatar: { type: String },
  
  // Onboarding & Preferências
  hasOnboarded: { type: Boolean, default: false },
  preferences: {
    role: { type: String }, 
    specialty: { type: String }, 
    mainGoal: { type: String } 
  },

  // Admin & Billing
  isAdmin: { type: Boolean, default: false },
  isPro: { type: Boolean, default: false },
  usageCount: { type: Number, default: 0 }, 
  stripeCustomerId: { type: String },
  subscriptionId: { type: String },
  subscriptionStatus: { type: String, default: 'free' },
  
  // --- 📍 NOVO CAMPO (SISTEMA DE CRÉDITOS) ---
  credits: { 
    type: Number, 
    default: 5 
  },
  
  createdAt: { type: Date, default: Date.now }
});

// Mantida sua lógica de hash de senha original
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);