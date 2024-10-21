const router = require('express').Router();
const knex = require('knex')(require('../knexfile'));
const bcrypt = require('bcryptjs');

router.post("/", async (req, res) => {
  const { username, lastName, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const [userId] = await knex('user').insert({ 
        name: username,
        last_name: lastName,
        email, 
        password: hashedPassword 
    });

    res.status(201).json({ userId });
  } catch (error) {
    console.error('Error during user registration:', error);
    res.status(400).json({ message: 'Error signing up', error: error.message });
  }
});

module.exports = router;
