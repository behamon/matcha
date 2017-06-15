const express = require('express');
const router = express.Router();
const { catchErrors } = require('../handlers/errorHandlers');

// Controllers
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const browseController = require('../controllers/browseController');
const profileController = require('../controllers/profileController');
const msgController = require('../controllers/msgController');

// Routes

router.get('/', (req, res) => {
	res.render('home', { title: 'Welcome to Matcha' });
});

router.get('/login', userController.loginForm);
router.post('/login', authController.isLoggedOut, catchErrors(authController.login));

router.post('/account/forgot', authController.forgot);
router.get('/account/reset/:token', catchErrors(authController.reset));
router.post('/account/reset/:token',
	authController.confirmedPasswords,
	catchErrors(authController.update)
);

router.get('/logout', authController.isLoggedIn, authController.logout);

router.get('/signup', userController.signupForm);
router.post('/signup',
	userController.validateData,
	catchErrors(userController.registerUser)
);

router.get('/browse',
	authController.isLoggedIn,
	catchErrors(authController.hasProfile),
	catchErrors(browseController.showProfiles)
);

router.get('/user/:user', authController.isLoggedIn, catchErrors(browseController.showUser));

router.get('/myprofile/:zone/:user', authController.isCorrectUser, catchErrors(profileController.editForm));
router.post('/myprofile/private/:user', authController.isCorrectUser, catchErrors(userController.editAccount));
router.post('/myprofile/public/:user',
	authController.isCorrectUser,
	profileController.upload,
	profileController.resize,
 	catchErrors(profileController.editProfile)
);

router.get('/:user/messages',
	catchErrors(authController.hasProfile),
	catchErrors(msgController.messages)
);

// API ?

router.get('/api/pics/:user', catchErrors(profileController.getNextPic));

// Export
module.exports = router;
