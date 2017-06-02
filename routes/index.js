const express = require('express');
const router = express.Router();
const { catchErrors } = require('../handlers/errorHandlers');
// Require Controllers
const userController = require('../controllers/userController');

// Routes

router.get('/', (req, res) => {
	res.render('home', { title: 'Welcome to Matcha' });
});

router.get('/signup', userController.signupForm);
router.post('/signup',
	userController.validateData,
	catchErrors(userController.registerUser)
);

// API ?

// Export
module.exports = router;
