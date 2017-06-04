const mongoose = require('mongoose');
const User = mongoose.model('User');
const promisify = require('es6-promisify');
const hash = require('mhash');


exports.editForm = async (req, res) => {
	if (req.params.user !== req.session.user) {
		req.flash('is-danger', 'You can only edit your profile !');
		res.redirect('/');
		return;
	}
	const user = await User.findOne({ email: req.params.user });
	res.render('editProfile', { title: "Edit my Profile" }, user);
};
