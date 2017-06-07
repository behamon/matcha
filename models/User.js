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
	resetPasswordExpires: Date,
	sexe: String,
	orientation: String,
	bio: String,
	age: Number,
	tags: [String],
	photos: [String],
	location: {
		type: { type: String, default: 'Point' },
		coordinates: [{ type: Number }]
	}
});

userSchema.pre('save', function(next) {
	if (!this.isModified('email'))
		return next();
	this.hash = mhash('md5', this.email);
	next();
});

// Might need virtual field, and autopopulate ?

userSchema.plugin(mongodbErrorHandler);

module.exports = mongoose.model('User', userSchema);
