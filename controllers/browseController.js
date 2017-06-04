const mongoose = require('mongoose');
const User = mongoose.model('User');
const promisify = require('es6-promisify');

exports.showProfiles = (req, res) => {
	res.render('browse', { title: "Browse Profiles" });
};
