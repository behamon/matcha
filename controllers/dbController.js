const MongoClient = require('mongodb').MongoClient;


exports.connect = async (uri) => {
	try {
		const db = await MongoClient.connect(uri);
	}
	catch (err) {
		console.log(err);
	}
};
