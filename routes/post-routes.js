const knex = require("knex")(require('../knexfile'));
const router = require('express').Router();


router.get('/', async (req, res) => {
    try {
        const posts = await knex('post')
            .join('user', 'post.user_id', '=', 'user.id')
            .select('post.*', 'user.name', 'user.profile_image');
        res.status(200).json(posts);
    } catch (err) {
        res.status(400).send(`Error retrieving posts: ${err.message}`);
    }
});

router.get('/:id', async (req, res) => {
    try {
        const post = await knex('post')
            .join('user', 'post.user_id', '=', 'user.id')
            .where('id', req.params.id)
            .select('post.*', 'user.name', 'user.profile_image')
            .first();
        if (!post) {
            return res.status(404).send('Post not found');
        }
        res.status(200).json(post);
    } catch (err) {
        res.status(400).send(`Error retrieving post: ${err.message}`);
    }
});

router.get('/user/:user_id/posts', async (req, res) => {
    const { user_id } = req.params;
    try {
        const posts = await knex('post')
            .join('user', 'post.user_id', '=', 'user.id')
            .where('post.user_id', user_id)
            .select('post.*', 'user.name', 'user.profile_image');

        if (posts.length === 0) {
            return res.status(404).send('No posts found for this user');
        }

        res.status(200).json(posts);
    } catch (err) {
        res.status(400).send(`Error retrieving posts for user: ${err.message}`);
    }
});

router.post('/', async (req, res) => {
    const { title, content, location, user_id } = req.body; 
    try {
        const [id] = await knex('post').insert({ title, content, location, user_id });
        res.status(201).json({ id });
    } catch (err) {
        res.status(400).send(`Error creating post: ${err.message}`);
    }
});


router.put('/:id', async (req, res) => {
    const { title, content, location, user_id } = req.body;  
    try {
        const post = await knex('post').where('id', req.params.id).first();
        if (post.user_id !== user_id) {
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
router.get('/user/:user_id/posts-with-messages', async (req, res) => {
    const { user_id } = req.params;
    try {
       
        const posts = await knex('chats')
            .join('post', 'chats.post_id', '=', 'post.id')
            .join('user', 'post.user_id', '=', 'user.id')
            .where('chats.user_id', user_id)
            .select('post.*', 'user.name', 'user.profile_image')
            .groupBy('post.id'); 

        if (posts.length === 0) {
            return res.status(404).send('No posts found where the user has participated in chats.');
        }

        res.status(200).json(posts);
    } catch (err) {
        res.status(400).send(`Error retrieving posts for user: ${err.message}`);
    }
});

router.delete('/:id', async (req, res) => {
    const { user_id } = req.body;  
    try {
        const post = await knex('post').where('id', req.params.id).first();
        if (!post) {
            return res.status(404).send('Post not found');
        }
        if (post.user_id !== user_id) {
            return res.status(403).send('You are not authorized to delete this post');
        }
        await knex('post').where('id', req.params.id).del();
        res.status(200).send('Post deleted');
    } catch (err) {
        res.status(400).send(`Error deleting post: ${err.message}`);
    }
});



module.exports = router;
