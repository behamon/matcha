const mongoose = require('mongoose');
const User = mongoose.model('User');
const promisify = require('es6-promisify');
// const mail = require('../handlers/mail');

exports.isLoggedIn = (req, res, next) => {
	console.log('TODO');
	next();
};
