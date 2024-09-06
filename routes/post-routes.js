const knex = require("knex")(require('../knexfile'));
const router = require('express').Router();
const authenticateToken = require('./middleware/auth-middleware');


//fetch all users posts

router.get('/', async (req, res)=>{
    try{
        const posts = await knex('post')
        .join('user', 'post.user_id', '=', 'user.id')
        .select('post.*', 'user.name', 'user.profile_image');
        res.status(200).json(posts);
    } catch (err){
    res.status(400).send((`Error retrieving posts: ${err.message}`))
}
});


// fetch a single post by ID

router.get('/:id', async(req, res)=>{
    try{
        const post = await knex('post')
        .join('user', 'post.user_id', '=', 'user.id')
        .where('id', req.params.id)
        .select('post.*', 'user.name', 'user.profile_image')
        .first();
        if(!post){
            return res.status(404).send('Post not found');
        } res.status(200).json(post);
    } catch (err){
        res.status(400).send(`Error retrieving post: ${err.message}`)
    }
});


//create a new post 

router.post('/', authenticateToken, async (req, res) => {
    const { title, content, location } = req.body;
    try {
      const [id] = await knex('post').insert({ title, content, location, user_id: req.user.id });  // Use req.user.id from JWT
      res.status(201).json({ id });
    } catch (err) {
      res.status(400).send(`Error creating post: ${err.message}`);
    }
  });

//update posts
router.put('/:id', authenticateToken, async (req, res) => {
    const { title, content, location } = req.body;
    try {
      const post = await knex('post').where('id', req.params.id).first();

      // Use req.user.id (from JWT) to check authorization
      if (post.user_id !== req.user.id) {
        return res.status(403).json({ message: 'You are not authorized to update this post' });
      }

      const updated = await knex('post').where('id', req.params.id).update({ title, content, location });
      if (updated) {
        res.status(200).json({ message: 'Post updated' });
      } else {
        res.status(404).json({ message: 'Post not found' });
      }
    } catch (err) {
      res.status(400).json({ message: `Error updating post: ${err.message}` });
    }
});

//delete a post  

router.delete('/:id', authenticateToken, async (req, res) => {
    try {
      const post = await knex('post').where('id', req.params.id).first();
      if (!post) {
        return res.status(404).send('Post not found');
      }

      // Check if the user making the request is the owner of the post
      if (post.user_id !== req.user.id) {
        return res.status(403).send('You are not authorized to delete this post');
      }

      await knex('post').where('id', req.params.id).del();
      res.status(200).send('Post deleted');
    } catch (err) {
      res.status(400).send(`Error deleting post: ${err.message}`);
    }
});

module.exports = router;