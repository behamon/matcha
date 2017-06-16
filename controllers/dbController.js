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
	const userd = (await col.find(user).toArray())[0];
	if (userd.orientation === "Both")
		var opp_sexe = { $or: [{ sexe: "A Man" }, { sexe: "A Woman" }]};
	else
		var opp_sexe = { sexe: userd.orientation };

	const matches = col.find({ $and: [
		opp_sexe,
		{ $or: [
			{ orientation: "Both" },
			{ orientation: userd.sexe }
		]}
	]}).toArray();
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

exports.getUsersWithQuery = async (user, query) => {
	const db = await connection();
	const col = await db.collection('users');
	const userd = (await col.find({ hash: user }).toArray())[0];
	if (userd.orientation === "Both")
		var opp_sexe = { $or: [{ sexe: "A Man" }, { sexe: "A Woman" }]};
	else
		var opp_sexe = { sexe: userd.orientation };
	var sort = {}; sort[query.sort] = 1;
	const matches = await col.aggregate([
			{ $match: { $and: [ opp_sexe, { hash: { $ne: userd.hash } }, { $or: [{ orientation: "Both" }, { orientation: userd.sexe }] }]}},
			{ $match: {age: { $gt: query.minage, $lt: query.maxage }}},
			{ $sort: sort },
			{ $project: { hash: 1, tags: true, _id: 0 }}
	]).toArray();
	return matches;
};
