const knex = require('knex')(require('../knexfile'));
const router = require('express').Router();
const multer = require('multer');
const jwt = require('jsonwebtoken'); 
const bcrypt = require('bcryptjs');
const authenticateToken = require('./middleware/auth-middleware');


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  });
  
  const upload = multer({ storage });

router.get('/', async (req, res) => {
    try {
      const users = await knex('user').select('*');
      res.status(200).json(users);
    } catch(err) {
      res.status(400).send(`Error retrieving users: ${err}`)
    }
  });

  router.get('/:id', async (req, res) => {
    try {
      const user = await knex('user').where('id', req.params.id).first();
      if (!user) {
        return res.status(404).send('User not found');
      }
      res.status(200).json(user);
    } catch(err) {
      res.status(400).send(`Error retrieving user: ${err}`)
    }
  });
   

  router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password are required' });
    }
    try {
        const user = await knex('user').where({ email }).first();
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }
        try {
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ success: false, message: 'Invalid email or password' });
            }
            const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
            return res.status(200).json({ success: true, userId: user.id, token });
        } catch (tokenError) {
            console.error('Error generating JWT token:', tokenError);
            return res.status(500).json({ success: false, message: 'Internal server error. Please try again.' });
        }
    } catch (dbError) {
        console.error('Database error during login:', dbError);
        if (dbError.code === 'ECONNREFUSED') {
            return res.status(500).json({ success: false, message: 'Database connection refused' });
        } else {
            return res.status(500).json({ success: false, message: `Database error: ${dbError.message}` });
        }
    }
});



router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const user = await knex('user').where('id', req.params.id).first();

        if (!user) {
            return res.status(404).send('User not found');
        }

        // Check if the user is authorized to delete the profile
        if (user.id !== req.user.id) {
            return res.status(403).send('You are not authorized to delete this profile');
        }

        // Delete the user
        await knex('user').where('id', req.params.id).del();
        res.status(200).send('User deleted');
    } catch (err) {
        res.status(400).send(`Error deleting user: ${err.message}`);
    }
});

router.put('/:id', authenticateToken, upload.single('profile_image'), async (req, res) => {
    const { name, password, about, riding_level } = req.body;
    const profileImage = req.file ? `/uploads/${req.file.filename}` : null;

    try {
        const updateData = { name, about, riding_level };

        // If a new password is provided, hash it before updating
        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        // If a new profile image is uploaded, update the image field
        if (profileImage) {
            updateData.profile_image = profileImage;
        }

        // Ensure the user trying to update the profile is the owner
        const user = await knex('user').where('id', req.params.id).first();
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.id !== req.user.id) {
            return res.status(403).json({ message: 'You are not authorized to update this profile' });
        }

        // Update the user's profile
        const updated = await knex('user').where('id', req.params.id).update(updateData);
        if (updated) {
            res.status(200).json({ message: 'User updated successfully' });
        } else {
            res.status(400).json({ message: 'Failed to update user' });
        }
    } catch (err) {
        res.status(400).json({ message: `Error updating user: ${err.message}` });
    }
});




module.exports = router;