const MongoClient = require('mongodb').MongoClient;

var _connection;

const connect =  () => {
  if (!process.env.DATABASE) {
    throw new Error(`Environment variable DATABASE must be set.`);
  }
  return MongoClient.connect(process.env.DATABASE);
};

const connection = () => {
  if (!_connection) {
    _connection = connect();
  }
  return _connection;
};

exports.getConnection = async () => {
	try {
		const db = await connection();
		return db;
	}
	catch (err) {
		console.error(err.message);
	}
};

exports.getUser = async (user) => {
	const db = await connection();
	const col = await db.collection('users');
	const res = await col.find(user).toArray();
	return res[0];
};

exports.getUsers = async () => {
	const db = await connection();
	const col = await db.collection('users');
	return col;
};

exports.updateUser = async (user, mods) => {
	const db = await connection();
	const col = await db.collection('users');
	const res = await col.findOneAndUpdate(user, mods, { returnOriginal: false });
	return res.value;
};

exports.createUser = async (user) => {
	const db = await connection();
	const col = await db.collection('users');
	await col.insertOne(user);
	const ret = await col.find({ email: user.email }).toArray();
	return ret[0];
};

exports.getGoodProfiles = async (user) => {
	const db = await connection();
	const col = await db.collection('users');
	const res = await col.find(user).toArray();
	if (res[0].orientation === "Both")
		var matches = await col.find().toArray();
	else
		var matches = await col.find({ sexe: res[0].orientation }).toArray();
	for (var i = 0; i < matches.length; i++) {
		if ((matches[i].orientation !== "Both" && matches[i].orientation !== res[0].sexe)
			|| matches[i].hash == res[0].hash) {
			matches.splice(i, 1);
			i = -1;
		}
	}
	return matches;
};

exports.createConversation = async (user1, user2) => {
	const db = await connection();
	const users = await db.collection('users');
	const conversations = await db.collection('conversations');
	const res = await users.find({ $or: [user1, user2] }).toArray();
	await conversations.insertOne({	users: [ res[0]._id, res[1]._id ]	});
	const ret = await conversations.find({
		$and: [{ users: res[0]._id, users: res[1]._id }]
	}).toArray();
	return ret[0];
};

exports.addMessage = async (msg, conv, author) => {
	const db = await connection();
	const messages = await db.collection('messages');
	await messages.insertOne({
		conv: conv,
		author: author,
		msg: msg,
		date: new Date(Date.now())
	});
};
