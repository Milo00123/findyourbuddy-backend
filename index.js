const express = require('express');
const app = express();
const cors = require('cors');
require("dotenv").config();
const path = require('path');
const session =require('express-session');


const PORT = process.env.PORT || 5050;

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

app.use(session({
  secret: 'yourSecretKey',  // Use a strong secret
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Use secure: true in production with HTTPS
}));


const userRoutes = require('./routes/user-routes.js');
const signUpRoute = require('./routes/sign-up-routes.js');
const postRoutes = require('./routes/post-routes.js');
const chatRoutes = require('./routes/chat-routes.js');

// basic home route
app.get('/', (req, res) => {
  res.send('Welcome to Find Your Buddy API');
});

app.use('/images', express.static(path.join(__dirname, 'seed-data/images')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.use(express.json());
//routes
app.use('/profile', userRoutes);
app.use('/sign-up', signUpRoute);
app.use('/posts', postRoutes)
app.use('/', userRoutes)
app.use('/chats', chatRoutes);

app.listen(PORT, () => {
  console.log(`running at http://localhost:${PORT}brotha`);
});