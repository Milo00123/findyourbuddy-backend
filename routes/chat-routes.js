const knex = require("knex")(require('../knexfile'));
const router = require('express').Router();



// Fetch messages for a specific post
router.get('/:postId', async (req, res) => {
    try {
      const messages = await knex('chats')
        .where('post_id', req.params.postId)
        .join('user', 'chats.user_id', '=', 'user.id')
        .select('chats.*', 'user.name', 'user.profile_image');
      res.status(200).json(messages);
    } catch (err) {
      res.status(400).send(`Error retrieving messages: ${err.message}`);
    }
  });

// Post a new message
router.post('/', async (req, res) => {
  const { post_id, user_id, message } = req.body;

  if (!post_id || !user_id || !message) {
    return res.status(400).json({ error: 'post_id, user_id, and message are required' });
  }

  try {
    await knex('chats').insert({ post_id, user_id, message });
    res.status(201).json({ message: 'Message posted successfully' });
  } catch (err) {
    res.status(500).json({ error: `Error posting message: ${err.message}` });
  }
});

// Edit a message
router.put('/:id', async (req, res) => {
    const { message } = req.body;
    try {
      const updated = await knex('chats').where('id', req.params.id).update({ message });
      if (updated) {
        res.status(200).json({ message: 'Message updated' });
      } else {
        res.status(404).json({ message: 'Message not found' });
      }
    } catch (err) {
      res.status(400).send(`Error updating message: ${err.message}`);
    }
  });
  
  // Delete a message
  router.delete('/:id', async (req, res) => {
    try {
      const deleted = await knex('chats').where('id', req.params.id).del();
      if (deleted) {
        res.status(200).json({ message: 'Message deleted' });
      } else {
        res.status(404).json({ message: 'Message not found' });
      }
    } catch (err) {
      res.status(400).send(`Error deleting message: ${err.message}`);
    }
  });

module.exports = router;