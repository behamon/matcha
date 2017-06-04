const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const mhash = require('mhash');
const mongodbErrorHandler = require('mongoose-mongodb-errors');

const userSchema = new mongoose.Schema({
	email: {
		type: String,
		unique: true,
		lowercase: true,
		trim: true,
		required: 'Email is required.'
	},
	hash: {
		type: String
	},
	first_name: {
		type: String,
		trim: true,
		required: 'First name is required.'
	},
	last_name: {
		type: String,
		trim: true,
		required: 'Last name is required.'
	},
	password: {
		type: String,
		required: 'Password is required.'
	},
	resetPasswordToken: String,
	resetPasswordExpires: Date
});

userSchema.pre('save', function(next) {
	if (!this.isModified('email'))
		return next();
	this.hash = mhash('md5', this.email);
	next();
});

userSchema.plugin(mongodbErrorHandler);

module.exports = mongoose.model('User', userSchema);
