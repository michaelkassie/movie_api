// index.js
const express = require('express');
const morgan = require('morgan');        
const path = require('path');

const app = express();
const port = 1080;                       

// Middleware 
app.use(morgan('common'));               
app.use(express.static(path.join(__dirname, 'public'))); 
app.use(express.json());

// Data
let topMovies = [
  { title: 'Inception', director: 'Christopher Nolan', year: 2010 },
  { title: 'The Dark Knight', director: 'Christopher Nolan', year: 2008 },
  { title: 'Interstellar', director: 'Christopher Nolan', year: 2014 },
  { title: 'Parasite', director: 'Bong Joon-ho', year: 2019 },
  { title: 'Whiplash', director: 'Damien Chazelle', year: 2014 },
  { title: 'Spirited Away', director: 'Hayao Miyazaki', year: 2001 },
  { title: 'The Matrix', director: 'The Wachowskis', year: 1999 },
  { title: 'Fight Club', director: 'David Fincher', year: 1999 },
  { title: 'City of God', director: 'Fernando Meirelles', year: 2002 },
  { title: 'The Grand Budapest Hotel', director: 'Wes Anderson', year: 2014 }
];

// Routes
app.get('/', (req, res) => {
  res.send('Welcome to my Movie API!');
});

app.get('/movies', (req, res) => {
  res.json(topMovies);
});




app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});


app.listen(port, () => {
  console.log(`App is listening on http://localhost:${port}`);
});
