const mongoose = require('mongoose');
const User = mongoose.model('User');
const promisify = require('es6-promisify');
const hash = require('mhash');

exports.signupForm = (req, res) => {
	res.render('signup', {title: "Sign-Up"});
};

function escapeHtml () {
	const entityMap = {
	  '&': '&amp;',
	  '<': '&lt;',
	  '>': '&gt;',
	  '"': '&quot;',
	  "'": '&#39;',
	  '/': '&#x2F;',
	  '`': '&#x60;',
	  '=': '&#x3D;',
		'(': 'z',
		')':'z'
	};
  return String(string).replace(/[&<>"'`=\/]/g, function (s) {
    return entityMap[s];
  });
}

exports.validateData = async (req, res, next) => {
	const regex = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
	const errors = [];

	if (!regex.test(req.body.email))
		errors.push('Invalid Email !');
	if (req.body.password.length < 8)
		errors.push('Password not strong enough. 8 Characters required.')
	if (req.body.password !== req.body.password_confirm)
		errors.push('Passwords do not Match !');
	else
		req.body.password = hash("whirlpool", req.body.password);

	const exists = await User.find({ email: req.body.email });
	if (exists.length)
		errors.push('A user with this email already exists');

	if (errors.length) {
		req.flash('is-danger', errors);
		res.redirect('/signup');
		return;
	}
	req.body = req.body.map(escapeHtml());
	next();
};

exports.registerUser = async (req, res) => {
	const user = await (new User(req.body)).save();
	req.flash('is-success', `Account successfully created. A confirmation e-mail has been sent to ${user.email}`);
	res.redirect('/');
};
