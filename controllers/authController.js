const mongoose = require('mongoose');
const User = mongoose.model('User');
const promisify = require('es6-promisify');
const mhash = require('mhash');
const crypto = require('crypto');
const mail = require('../handlers/mail');


exports.isLoggedIn = (req, res, next) => {
	if (req.session.user.length) {
		next();
	}
	else {
		req.flash('is-warning', "You must be logged-in to access this page");
		res.redirect('/login');
	}
};

exports.isLoggedOut = (req, res, next) => {
	if (!req.session.user) {
		next();
	}
	else {
		req.flash('is-warning', "Already logged-in !");
		res.redirect('/');
	}
};

exports.login = async (req, res) => {
	const phash = mhash("whirlpool", req.body.password);
	const user = await User.findOne({ $and: [{email: req.body.email}, {password: phash}] });
	if (user) {
		req.session.email = user.email;
		req.session.user = user.hash;

		req.flash("is-success", "Successfully logged in !");
		res.redirect('/');
	}
	else {
		req.flash("is-danger", "Invalid email/password. Please try again.");
		res.redirect('/login');
	}
};

exports.logout = (req, res) => {
	req.session.user = "";
	req.session.email = "";
	req.flash('is-success', "Successfully logged out ! Come back soon");
	res.redirect('/');
};

exports.forgot = async (req, res) => {
	const user = await User.findOne({ email: req.body.email });
	if (!user) {
		req.flash('is-warning', 'No account with that email exists.');
		res.redirect('/login');
	}
	user.resetPasswordToken = crypto.randomBytes(20).toString('hex');
	user.resetPasswordExpires = Date.now() + 3600000;
	await user.save();

	const resetURL = `http://${req.headers.host}/account/reset/${user.resetPasswordToken}`;
	const content = `Please go to this url to reset your password: ${resetURL}`;

	await mail.send({ user, content });
	req.flash('is-success', `You have been emailed a password reset link.`);
	res.redirect('/login');
};

exports.reset = async (req, res) => {
	const user = await User.findOne({
		resetPasswordToken: req.params.token,
		resetPasswordExpires: { $gt: Date.now() }
	});
	if (!user) {
		req.flash('is-warning', 'Password reset is invalid or has expired');
		return res.redirect('/login');
	}
	res.render('resetPass', { title: 'Reset your Password' });
};

exports.confirmedPasswords = (req, res, next) => {
	console.log(req.body);
	if (req.body.password === req.body.password_confirm && req.body.password.length > 7)
		return next();
	req.flash('is-warning', 'Passwords do not match!');
	res.redirect('back');
};

exports.update = async (req, res) => {
	const user = await User.findOne({
		resetPasswordToken: req.params.token,
		resetPasswordExpires: { $gt: Date.now() }
	});
	if (!user) {
		req.flash('is-warning', 'Password reset is invalid or has expired!');
		return res.redirect('/login');
	}
	user.password = mhash('whirlpool', req.body.password);
	user.resetPasswordToken = undefined;
	user.resetPasswordExpires = undefined;
	await user.save();
	req.flash('is-success', 'Password reset sucessful! You may now login');
	res.redirect('/login');
}
