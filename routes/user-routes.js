
const router = require('express').Router();
const multer = require('multer');
const jwt = require('jsonwebtoken'); 


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
        const user = await knex('user').where({ email, password }).first();
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }
        try {
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


router.delete('/:id', async (req, res)=>{
    try{
        await knex('user').where('id', req.params.id).del();
        res.status(200).send('user deleted');
    } catch (err){
        res.status(400).send(`Error deleting User:${err.message} `)
    }
});

router.put('/:id', upload.single('profile_image'), async (req, res) => {
    const { password, about, riding_level } = req.body;
    const profileImage = req.file ? `/uploads/${req.file.filename}` : null;
  
    try {
      const updateData = { password, about, riding_level };
      if (profileImage) {
        updateData.profile_image = profileImage;
      }
  
      const updated = await knex('user').where('id', req.params.id).update(updateData);
      if (updated) {
        res.status(200).json({ message: 'User updated' });
      } else {
        res.status(404).json({ message: 'User not found' });
      }
    } catch (err) {
      res.status(400).json({ message: `Error updating user: ${err.message}` });
    }
  });



module.exports = router;