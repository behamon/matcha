const promisify = require('es6-promisify');
const mhash = require('mhash');
const crypto = require('crypto');
const mail = require('../handlers/mail');
const db = require('./dbController');

exports.isLoggedIn = (req, res, next) => {
	if (req.session.user && req.session.user.length) {
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
	const user = await db.getUser({ $and: [{email: req.body.email}, {password: phash}] });
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
	const token = {
		resetToken: crypto.randomBytes(20).toString('hex'),
		resetExpires: new Date(Date.now() + 3600000)
	};
	const user = await db.updateUser(
		{ email: req.body.email },
		{ $set: token }
	);
	if (!user) {
		req.flash('is-warning', 'No account with this email exists.');
		res.redirect('/login');
		return;
	}
	const resetURL = `http://${req.headers.host}/account/reset/${user.resetToken}`;
	const content = `Please go to this url to reset your password: ${resetURL}`;
	await mail.send({ email: user.email, content });
	req.flash('is-success', `You have been emailed a password reset link.`);
	res.redirect('/login');
};

exports.reset = async (req, res) => {
	const user = await db.getUser({
		$and: [
			{ resetToken: req.params.token },
			{ resetExpires: {$gt: new Date(Date.now())}}
		]
	});
	if (!user) {
		req.flash('is-warning', 'Password reset is invalid or has expired');
		return res.redirect('/login');
	}
	res.render('resetPass', { title: 'Reset your Password' });
};

exports.confirmedPasswords = (req, res, next) => {
	if (req.body.password === req.body.password_confirm && req.body.password.length > 7)
		return next();
	req.flash('is-warning', 'Passwords do not match!');
	res.redirect('back');
};

exports.update = async (req, res) => {
	const user = await db.getUser({
		$and: [
			{ resetToken: req.params.token },
			{ resetExpires: {$gt: new Date(Date.now())}}
		]
	});
	if (!user) {
		req.flash('is-warning', 'Password reset is invalid or has expired');
		return res.redirect('/login');
	}
	const modifs = {
		resetToken: undefined,
		resetExpires: undefined,
		password: mhash('whirlpool', req.body.password)
	};
	await db.updateUser(
		{ resetToken: req.params.token },
		{ $set: modifs }
	);
	req.flash('is-success', 'Password reset sucessful! You may now login');
	res.redirect('/login');
}

exports.isCorrectUser = (req, res, next) => {
	if (req.params.user !== req.session.user) {
		req.flash('is-danger', 'You cannot access this page !');
		res.redirect('back');
		return;
	}
	next();
};

exports.hasProfile = async (req, res, next) => {
	const user = await db.getUser({ hash: req.session.user });
	if (!user || !user.sexe || !user.orientation || !user.age) {
		req.flash('is-danger', 'You cannot acces this page');
		return res.redirect(`/`);
	}
	next();
};
