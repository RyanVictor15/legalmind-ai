const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({

  organization: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Organization' 
  },
  organizationRole: {
    type: String,
    enum: ['owner', 'admin', 'editor', 'viewer'],
    default: 'owner' // Se ele criar a conta sozinho, ele é o dono do próprio "time de 1"
  },
  
  // ... (Campos anteriores: firstName, googleId, etc. MANTENHA ELES)
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  
  // OAuth
  googleId: { type: String, unique: true, sparse: true },
  avatar: { type: String },
  
  // 📍 NOVO: ONBOARDING & PREFERÊNCIAS
  hasOnboarded: { type: Boolean, default: false },
  preferences: {
    role: { type: String }, // Ex: Advogado, Estudante, Paralegal
    specialty: { type: String }, // Ex: Civil, Penal, Trabalhista
    mainGoal: { type: String } // Ex: Agilidade, Precisão, Estudo
  },

  // ... (Campos de Billing, Admin, etc. MANTENHA ELES)
  isAdmin: { type: Boolean, default: false },
  isPro: { type: Boolean, default: false },
  usageCount: { type: Number, default: 0 }, // Importante manter este
  stripeCustomerId: { type: String },
  subscriptionId: { type: String },
  subscriptionStatus: { type: String, default: 'free' },
  
  createdAt: { type: Date, default: Date.now }
});

// ... (Métodos pre-save e matchPassword MANTENHA ELES)
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);