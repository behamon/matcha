const promisify = require('es6-promisify');
const hash = require('mhash');
const mail = require('../handlers/mail');
const db = require('./dbController');


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

	if (!req.body.first_name.length || !req.body.last_name.length)
		errs.push('Please fill all fields!');
	if (!regex.test(req.body.email))
		errs.push('Invalid Email !');
	if (req.body.password.length < 8)
		errs.push('Password not strong enough. 8 Characters required.')
	if (req.body.password !== req.body.password_confirm)
		errs.push('Passwords do not Match !');
	else
		req.body.password = hash("whirlpool", req.body.password);

	const exists = await db.getUser({ email: req.body.email });
	if (exists)
		errs.push('A user with this email already exists');

	if (errs.length) {
		req.flash('is-danger', errs);
		res.redirect('/signup');
		return;
	}
	delete req.body.password_confirm;
	delete req.body.signup;
	req.body.hash = hash("md5", req.body.email);
	for (var input in req.body) {
		if (req.body.hasOwnProperty(input) && (input === "first_name" || input === "last_name")) {
			req.body[input] = escapeHtml(req.body[input]);
		}
	}
	next();
};

exports.registerUser = async (req, res, next) => {
	const user = await db.createUser(req.body);
	if (!user) {
		req.flash('is-warning', `Something went wrong. Please try again later.`);
		res.redirect('/signup');
		return;
	}
	await mail.send({ email: user.email, content: "Thanks for signing up on Matcha ! Enjoy !", subject: "Account Creation" });
	req.flash('is-success', `Account successfully created. You can now login as <strong>${user.email}</strong>`);
	res.redirect('/login');
};

const confirmedPasswords = (pw, pwc) => {
	if (pw === pwc && pw.length > 7)
		return true;
	else
		return false;
};

exports.editAccount = async (req, res) => {
	if (req.body.passChange) {
		if (confirmedPasswords(req.body.password, req.body.password_confirm)) {
			const modif = { password: hash('whirlpool', req.body.password) };
			await db.updateUser(
				{ hash: req.params.user },
				{ $set: modif }
			);
			req.flash('is-success', "Password changed successfully.");
			res.redirect('back');
		}
		else {
			req.flash('is-warning', 'Passwords do not match or are less than 8 characters.');
			res.redirect('back');
		}
	}
	else {
		const regex = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);

		if (!regex.test(req.body.email)) {
			req.flash('is-danger', "Invalid Email!");
			res.redirect('back');
			return;
		}
		const exists = await db.getUser({ email: req.body.email });
		const actual = await db.getUser({ hash: req.params.user });
		if (exists && exists.email !== actual.email) {
			req.flash('is-danger', "A user with this email already exists");
			return res.redirect('back');
		}
		delete req.body.edit;
		for (var input in req.body) {
			if (req.body.hasOwnProperty(input) && (input === "first_name" || input === "last_name")) {
				req.body[input] = escapeHtml(req.body[input]);
			}
		}
		req.body.hash = hash('md5', req.body.email);
		const user = await db.updateUser({ hash: req.params.user }, { $set: req.body });
		req.session.user = user.hash;
		req.session.email = user.email;
		req.flash('is-success', 'Successfully updated your infos.');
		res.redirect(`/myprofile/private/${user.hash}`);
	}
};
