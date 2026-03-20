const express = require('express');
const router = express.Router();
const { createUser, getUsers, deleteUser, updateProfileImage, updateUser, adminResetPassword } = require('../controllers/userController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/', auth, createUser);
router.get('/', auth, getUsers);
router.put('/:id', auth, updateUser);
router.delete('/:id', auth, deleteUser);
router.post('/profile-image', [auth, upload.single('image')], updateProfileImage);
router.post('/admin-reset-password', auth, adminResetPassword);

module.exports = router;
