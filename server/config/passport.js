const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const crypto = require('crypto');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback" // URL relativa ao servidor
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // 1. Verifica se usuário já existe com esse Google ID
      let user = await User.findOne({ googleId: profile.id });

      if (user) {
        return done(null, user);
      }

      // 2. Verifica se existe usuário com esse email (Login híbrido)
      // Se a pessoa já se cadastrou com email/senha, vinculamos a conta Google
      const email = profile.emails[0].value;
      user = await User.findOne({ email });

      if (user) {
        user.googleId = profile.id;
        user.avatar = profile.photos[0].value;
        await user.save();
        return done(null, user);
      }

      // 3. Se não existe, cria um novo usuário
      // Geramos uma senha aleatória forte pois ele não usará senha para logar
      const randomPassword = crypto.randomBytes(16).toString('hex');

      user = await User.create({
        googleId: profile.id,
        firstName: profile.name.givenName || 'Usuário',
        lastName: profile.name.familyName || 'Google',
        email: email,
        password: randomPassword, 
        avatar: profile.photos[0].value,
        isPro: false // Começa como Free
      });

      done(null, user);

    } catch (error) {
      done(error, null);
    }
  }
));

// Serialização necessária para sessão (embora usaremos JWT, o Passport exige configuração mínima)
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => done(err, user));
});