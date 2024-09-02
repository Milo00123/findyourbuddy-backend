const express = require('express');
const app = express();
require("dotenv").config();

const PORT = process.env.PORT || 5050;

// basic home route
app.get('/', (req, res) => {
  res.send('Welcome to my API');
});

app.listen(PORT, () => {
  console.log(`running at http://localhost:${PORT}brotha`);
});