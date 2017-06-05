const mongoose = require('mongoose');
const User = mongoose.model('User');
const promisify = require('es6-promisify');
const hash = require('mhash');
const multer = require('multer');

const multerOptions = {
	storage: multer.memoryStorage(),
	fileFilter(req, file, next) {
		const isPhoto = file.mimetype.startsWith('image/');
		if (isPhoto) {
			next(null, true);
		}
		else {
			next({ message: 'Wrong filetype!' }, false);
		}
	}
};

exports.editForm = async (req, res) => {
	const userdata = await User.findOne({ hash: req.params.user });
	res.render('editProfile', { title: "My Profile", userdata, which: req.params.zone });
};

exports.upload = multer(multerOptions).array('photo');
