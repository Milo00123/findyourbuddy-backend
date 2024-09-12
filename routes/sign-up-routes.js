const router = require('express').Router();
const knex = require('knex')(require('../knexfile'));
const bcrypt = require('bcryptjs');

router.post("/", async (req, res) => {
  const { username, lastName, email, password } = req.body;
  try {
    // Hash the user's password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert the new user into the database
    const [userId] = await knex('user').insert({ 
        name: username,
        last_name: lastName,
        email, 
        password: hashedPassword 
    });

    // Return the newly created user ID (without a JWT)
    res.status(201).json({ userId });
  } catch (error) {
    console.error('Error during user registration:', error);
    res.status(400).json({ message: 'Error signing up', error: error.message });
  }
});

module.exports = router;
