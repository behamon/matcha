const express = require('express');
const router = express.Router();
const { catchErrors } = require('../handlers/errorHandlers');
// Require Controllers


// Routes

router.get('/', (req, res) => {
	res.render('home', { title: 'Welcome to Matcha' })
});

// API ?

// Export
module.exports = router;
