const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const mongodbErrorHandler = require('mongoose-mongodb-errors');

const profileSchema = new mongoose.Schema({
	user: {
		type: mongoose.Schema.ObjectId,
		ref: 'User'
	},
	sexe: String,
	mate: String,
	bio: String,
	tags: [String],
	photos: [String]
});

profileSchema.plugin(mongodbErrorHandler);

module.exports = mongoose.model('Profile', profileSchema);
