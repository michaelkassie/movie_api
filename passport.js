const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const Models = require('./models.js');
const passportJWT = require('passport-jwt');

const Users = Models.User;

const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;

// LOCAL STRATEGY: used only for /login
passport.use(
  new LocalStrategy(
    {
      usernameField: 'Username',
      passwordField: 'Password',
    },
    async (username, password, done) => {
      try {
        const user = await Users.findOne({ Username: username });

        if (!user) {
          return done(null, false, { message: 'Incorrect username or password.' });
        }

        // ✅ compare plaintext password to hashed password in DB
        if (!user.validatePassword(password)) {
          return done(null, false, { message: 'Incorrect username or password.' });
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

// JWT STRATEGY: used for all protected endpoints
passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET, // ✅ use env var
    },
    async (jwtPayload, done) => {
      try {
        const user = await Users.findById(jwtPayload._id);
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);
