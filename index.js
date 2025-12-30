// index.js
require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');
const { check, validationResult } = require('express-validator');

const Models = require('./models.js');

const app = express();

// Models
const Movies = Models.Movie;
const Users = Models.User;

// Middleware
app.use(morgan('common'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(cors());


mongoose.connect(process.env.CONNECTION_URI);


const passport = require('passport');
require('./passport');          
require('./auth')(app);        

// SIMPLE ROOT ROUTE
app.get('/', (req, res) => {
  res.send('Welcome to myFlix API');
});


// 1. Return a list of ALL movies
app.get(
  '/movies',
  
  async (req, res) => {
    try {
      const movies = await Movies.find();
      return res.json(movies);
    } catch (err) {
      console.error(err);
      return res.status(500).send('Error: ' + err);
    }
  }
);

// 2. Return data about a single movie by title
app.get(
  '/movies/:Title',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const movie = await Movies.findOne({ Title: req.params.Title });
      if (!movie) return res.status(404).send('Movie not found');
      return res.json(movie);
    } catch (err) {
      console.error(err);
      return res.status(500).send('Error: ' + err);
    }
  }
);

// 3. Return data about a genre by name
app.get(
  '/genres/:Name',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const movie = await Movies.findOne({ 'Genre.Name': req.params.Name });
      if (!movie || !movie.Genre) return res.status(404).send('Genre not found');
      return res.json(movie.Genre);
    } catch (err) {
      console.error(err);
      return res.status(500).send('Error: ' + err);
    }
  }
);

// 4. Return data about a director by name
app.get(
  '/directors/:Name',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const movie = await Movies.findOne({ 'Director.Name': req.params.Name });
      if (!movie || !movie.Director) return res.status(404).send('Director not found');
      return res.json(movie.Director);
    } catch (err) {
      console.error(err);
      return res.status(500).send('Error: ' + err);
    }
  }
);



app.post(
  '/users',
  [
    check('Username', 'Username is required and must be at least 5 characters').isLength({ min: 5 }),
    check('Username', 'Username must be alphanumeric').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email must be valid').isEmail()
  ],
  async (req, res) => {
    // validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

    try {
      const existingUser = await Users.findOne({ Username: req.body.Username });
      if (existingUser) return res.status(400).send(req.body.Username + ' already exists');

      const hashedPassword = Users.hashPassword(req.body.Password);

      const newUser = await Users.create({
        Username: req.body.Username,
        Password: hashedPassword,
        Email: req.body.Email,
        Birthday: req.body.Birthday
      });

      return res.status(201).json(newUser);
    } catch (err) {
      console.error(err);
      return res.status(500).send('Error: ' + err);
    }
  }
);

app.get(
  '/users',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const users = await Users.find();
      return res.json(users);
    } catch (err) {
      console.error(err);
      return res.status(500).send('Error: ' + err);
    }
  }
);


app.get(
  '/users/:Username',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    if (req.user.Username !== req.params.Username) {
      return res.status(400).send('Permission denied');
    }

    try {
      const user = await Users.findOne({ Username: req.params.Username });
      if (!user) return res.status(404).send('User not found');
      return res.json(user);
    } catch (err) {
      console.error(err);
      return res.status(500).send('Error: ' + err);
    }
  }
);

// 6. Allow users to update their user info - PROTECTED + AUTH CHECK
app.put(
  '/users/:Username',
  passport.authenticate('jwt', { session: false }),
  [
    // For updates, you can allow fields to be optional, but if present, validate them.
    check('Username')
      .optional()
      .isLength({ min: 5 }).withMessage('Username must be at least 5 characters')
      .isAlphanumeric().withMessage('Username must be alphanumeric'),
    check('Password')
      .optional()
      .not().isEmpty().withMessage('Password cannot be empty'),
    check('Email')
      .optional()
      .isEmail().withMessage('Email must be valid'),
    check('Birthday')
      .optional()
      .isISO8601().withMessage('Birthday must be a valid date')
  ],
  async (req, res) => {
    if (req.user.Username !== req.params.Username) {
      return res.status(400).send('Permission denied');
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

    try {
      // Build the update object only with fields that were actually sent
      const updateFields = {};

      if (req.body.Username !== undefined) updateFields.Username = req.body.Username;
      if (req.body.Email !== undefined) updateFields.Email = req.body.Email;
      if (req.body.Birthday !== undefined) updateFields.Birthday = req.body.Birthday;

      // If they are changing password, hash it
      if (req.body.Password !== undefined) {
        updateFields.Password = Users.hashPassword(req.body.Password);
      }

      const updatedUser = await Users.findOneAndUpdate(
        { Username: req.params.Username },
        { $set: updateFields },
        { new: true }
      );

      if (!updatedUser) return res.status(404).send('User not found');
      return res.json(updatedUser);
    } catch (err) {
      console.error(err);
      return res.status(500).send('Error: ' + err);
    }
  }
);

// 7. Add a movie to favorites - PROTECTED + AUTH CHECK
app.post(
  '/users/:Username/movies/:MovieID',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    if (req.user.Username !== req.params.Username) {
      return res.status(400).send('Permission denied');
    }

    try {
      const updatedUser = await Users.findOneAndUpdate(
        { Username: req.params.Username },
        { $addToSet: { FavoriteMovies: req.params.MovieID } },
        { new: true }
      );

      if (!updatedUser) return res.status(404).send('User not found');
      return res.json(updatedUser);
    } catch (err) {
      console.error(err);
      return res.status(500).send('Error: ' + err);
    }
  }
);

// 8. Remove a movie from favorites - PROTECTED + AUTH CHECK
app.delete(
  '/users/:Username/movies/:MovieID',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    if (req.user.Username !== req.params.Username) {
      return res.status(400).send('Permission denied');
    }

    try {
      const updatedUser = await Users.findOneAndUpdate(
        { Username: req.params.Username },
        { $pull: { FavoriteMovies: req.params.MovieID } },
        { new: true }
      );

      if (!updatedUser) return res.status(404).send('User not found');
      return res.json(updatedUser);
    } catch (err) {
      console.error(err);
      return res.status(500).send('Error: ' + err);
    }
  }
);

app.delete(
  '/users/:Username',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    if (req.user.Username !== req.params.Username) {
      return res.status(400).send('Permission denied');
    }

    try {
      const user = await Users.findOneAndRemove({ Username: req.params.Username });
      if (!user) return res.status(400).send(req.params.Username + ' was not found');
      return res.status(200).send(req.params.Username + ' was deleted.');
    } catch (err) {
      console.error(err);
      return res.status(500).send('Error: ' + err);
    }
  }
);


const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log('Listening on port ' + port);
});
