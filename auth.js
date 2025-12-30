const jwt = require('jsonwebtoken');
const passport = require('passport');

require('./passport');

const jwtSecret = process.env.JWT_SECRET; 

const generateJWTToken = (user) => {
  return jwt.sign(
    { _id: user._id, Username: user.Username }, 
    jwtSecret,
    {
      subject: user.Username,
      expiresIn: '7d',
      algorithm: 'HS256',
    }
  );
};

module.exports = (app) => {
  app.post('/login', (req, res) => {
    passport.authenticate('local', { session: false }, (error, user, info) => {
      if (error || !user) {
        return res.status(400).json({ message: info?.message || 'Incorrect username or password.' });
      }

      req.login(user, { session: false }, (error) => {
        if (error) return res.status(500).send(error);

        const token = generateJWTToken(user);
        return res.json({ user, token });
      });
    })(req, res);
  });
};
