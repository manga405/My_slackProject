const router = require("express").Router();
const authController = require('../controllers/authController');
const multer = require('multer')
const upload = multer({ dest: 'assets/avatar' });

router.post('/signup', upload.single('avatar'), authController.signUp);
router.post('/signin', authController.signIn);
router.get('/check', authController.check);

module.exports = router;