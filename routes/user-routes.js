const knex = require('knex')(require('../knexfile'));
const router = require('express').Router();
const multer = require('multer');
const bcrypt = require('bcryptjs');

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
    } catch (err) {
      res.status(400).send(`Error retrieving users: ${err}`);
    }
});

router.get('/:id', async (req, res) => {
    try {
      const user = await knex('user').where('id', req.params.id).first();
      if (!user) {
        return res.status(404).send('User not found');
      }
      res.status(200).json(user);
    } catch (err) {
      res.status(400).send(`Error retrieving user: ${err}`);
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password are required' });
    }
    try {
        const user = await knex('user').where({ email }).first();
        console.log('User retrieved:', user);
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        console.log('Password match result:', isMatch);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }
        req.session.userId = user.id;
        console.log('Session set:', req.session.userId); 
        console.log('Session set for user:', req.session.userId);
        return res.status(200).json({ success: true, userId: user.id });
    } catch (dbError) {
        return res.status(500).json({ success: false, message: `Database error: ${dbError.message}` });
    }
});

router.delete('/:id', async (req, res) => {
    const sessionUserId = req.session.userId;

    try {
        const user = await knex('user').where('id', req.params.id).first();
        if (!user) {
            return res.status(404).send('User not found');
        }

        if (user.id !== sessionUserId) {  
            return res.status(403).send('You are not authorized to delete this profile');
        }

        await knex('user').where('id', req.params.id).del();
        res.status(200).send('User deleted');
    } catch (err) {
        res.status(400).send(`Error deleting user: ${err.message}`);
    }
});

router.put('/:id', upload.single('profile_image'), async (req, res) => {
    const { name, about, riding_level } = req.body;
    const profileImage = req.file ? `/uploads/${req.file.filename}` : null;

    const sessionUserId = req.session.userId;
    console.log('Session on profile update:', sessionUserId);
    try {
        const updateData = {};
        if (name) updateData.name = name;
        if (about) updateData.about = about;
        if (riding_level) updateData.riding_level = riding_level;
        if (profileImage) updateData.profile_image = profileImage;

        console.log('sessionUserId:', sessionUserId);

        const user = await knex('user').where('id', req.params.id).first();
        if (!user) 
            return res.status(404).json({ message: 'User not found' });

        if (user.id !== sessionUserId) 
            return res.status(403).json({ message: 'You are not authorized to update this profile' });
        
        const updated = await knex('user').where('id', req.params.id).update(updateData);
        if (updated) {
            const updatedUser = await knex('user').where('id', req.params.id).first();
            delete updatedUser.password;  
            res.status(200).json({ message: 'User updated successfully', user: updatedUser });
        } else {
            res.status(400).json({ message: 'Failed to update user' });
        }
    } catch (err) {
        res.status(400).json({ message: `Error updating user: ${err.message}` });
    }
});
router.put('/password/:id', async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const sessionUserId = req.session.userId;

    try {
        const user = await knex('user').where('id', req.params.id).first();
        if (!user) 
            return res.status(404).json({ message: 'User not found' });     
        if (user.id !== sessionUserId) 
            return res.status(403).json({ message: 'You are not authorized to update this password' }); 
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) 
            return res.status(401).json({ message: 'Current password is incorrect' });      
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        await knex('user').where('id', req.params.id).update({ password: hashedNewPassword });

        res.status(200).json({ message: 'Password updated successfully' });
    } catch (err) {
        res.status(500).json({ message: `Error updating password: ${err.message}` });
    }
});

module.exports = router;
