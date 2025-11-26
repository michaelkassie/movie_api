
const express= require('express');
const morgan= require('morgan');
const path=require('path');





const app= express();

app.use(morgan('common'));
app.use(express.static(path.join(__dirname,'public')));
app.use(express.json());


let movies = [
  { 
    id: 1,
    title: 'Inception',
    genre: 'Sci-Fi',
    director: 'Christopher Nolan',
    description: 'A skilled thief who steals information through dreams is given a chance to erase his criminal record.',
    imageURL: 'https://m.media-amazon.com/images/I/51zUbui+gbL._AC_.jpg',
    featured: true
  },
  { 
    id: 2,
    title: 'Parasite',
    genre: 'Thriller',
    director: 'Bong Joon-ho',
    description: 'A poor family schemes to become employed by a wealthy household and infiltrate their lives.',
    imageURL: 'https://m.media-amazon.com/images/I/91qvN3eNqvL._AC_UF894,1000_QL80_.jpg',
    featured: true
  },
  { 
    id: 3,
    title: 'Whiplash',
    genre: 'Drama',
    director: 'Damien Chazelle',
    description: 'A young drummer enrolls in a music conservatory where he faces abuse from a ruthless instructor.',
    imageURL: 'https://m.media-amazon.com/images/I/71pVtxg0uAL._AC_UF894,1000_QL80_.jpg',
    featured: false
  }
];




// 1. Return list of ALL movies
app.get('/movies', (req, res) => {
  res.status(200).json(movies);
});

// 2. Return data about a single movie by title
app.get('/movies/:title', (req, res) => {
  const movie = movies.find(m => m.title.toLowerCase() === req.params.title.toLowerCase());
  if (!movie) return res.status(404).send('Movie not found.');
  res.status(200).json(movie);
});

// 3. Return data about a genre by name
app.get('/genres/:name', (req, res) => {
  const genre = req.params.name;
  res.status(200).send(`Information about the genre: ${genre}`);
});

// 4. Return data about a director by name
app.get('/directors/:name', (req, res) => {
  const director = req.params.name;
  res.status(200).send(`Information about the director: ${director}`);
});



// 5. Register a new user
app.post('/users', (req, res) => {
  const newUser = req.body;
  if (!newUser.username) return res.status(400).send('Username required.');
  res.status(201).send(`User ${newUser.username} registered successfully.`);
});

// 6. Update user info (e.g., username)
app.put('/users/:username', (req, res) => {
  res.status(200).send(`User ${req.params.username} information updated.`);
});

// 7. Add a movie to a user’s list of favorites
app.post('/users/:username/favorites/:movieId', (req, res) => {
  res.status(201).send(`Movie ${req.params.movieId} added to ${req.params.username}'s favorites.`);
});

// 8. Remove a movie from a user’s list of favorites
app.delete('/users/:username/favorites/:movieId', (req, res) => {
  res.status(200).send(`Movie ${req.params.movieId} removed from ${req.params.username}'s favorites.`);
});

// 9. Deregister a user
app.delete('/users/:username', (req, res) => {
  res.status(200).send(`User ${req.params.username} deregistered.`);
});


app.get('/', (req, res) => res.send('Welcome to the myFlix API!'));

const PORT = 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
