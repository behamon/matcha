const mongoose = require('mongoose');
const User = mongoose.model('User');
const promisify = require('es6-promisify');
const hash = require('mhash');
const mail = require('../handlers/mail');

exports.signupForm = (req, res) => {
	res.render('signup', {title: "Sign-Up"});
};

exports.loginForm = (req, res) => {
	res.render('login', {title: "Login"});
};

function escapeHtml(string) {
	const entityMap = {
	  '&': '&amp;',
	  '<': '&lt;',
	  '>': '&gt;',
	  '"': '&quot;',
	  "'": '&#39;',
	  '/': '&#x2F;',
	  '`': '&#x60;',
	  '=': '&#x3D;',
	};
  return String(string).replace(/[&<>"'`=\/]/g, function (s) {
    return entityMap[s];
  });
}

exports.validateData = async (req, res, next) => {
	const regex = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
	const errs = [];

	if (!regex.test(req.body.email))
		errs.push('Invalid Email !');
	if (req.body.password.length < 8)
		errs.push('Password not strong enough. 8 Characters required.')
	if (req.body.password !== req.body.password_confirm)
		errs.push('Passwords do not Match !');
	else
		req.body.password = hash("whirlpool", req.body.password);

	const exists = await User.find({ email: req.body.email });
	if (exists.length)
		errs.push('A user with this email already exists');

	if (errs.length) {
		req.flash('is-danger', errs);
		res.redirect('/signup');
		return;
	}
	for (var input in req.body) {
		if (req.body.hasOwnProperty(input) && (input === "first_name" || input === "last_name")) {
			req.body[input] = escapeHtml(req.body[input]);
		}
	}
	next();
};

exports.registerUser = async (req, res, next) => {
	const user = await (new User(req.body)).save();
	if (!user) {
		req.flash('is-warning', `Something went wrong. Please try again later.`);
		res.redirect('/signup');
		return;
	}
	await mail.send({ user, content: "Thanks for signing up on Matcha ! Enjoy !" });
	req.flash('is-success', `Account successfully created. You can now login as <strong>${user.email}</strong>`);
	res.redirect('/login');
};
