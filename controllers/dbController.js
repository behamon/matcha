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
	const res = await col.findOne(user);
	return res;
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

exports.createConversation = async (user1, user2) => {
	const db = await connection();
	const users = await db.collection('users');
	const conversations = await db.collection('conversations');
	const res = await users.find({ $or: [user1, user2] }).toArray();
	const iid = await conversations.insertOne({
		user0: {
			name: `${res[0].first_name} ${res[0].last_name}`,
			hash: res[0].hash
		},
		user1: {
			name: `${res[1].first_name} ${res[1].last_name}`,
			hash: res[1].hash
		}
	});
	const ret = await conversations.findOne({ _id: iid.insertedId });
	return ret;
};

exports.getConvs = async (user) => {
	const db = await connection();
	const conversations = await db.collection('conversations');
	const res = await conversations.find({ $or: [
			{ 'user0.hash': user.hash },
			{ 'user1.hash': user.hash }
		]
	}).toArray();
	return res;
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

exports.getGoodProfiles = async (user) => {
	const db = await connection();
	const col = await db.collection('users');

	if (user.orientation === "Both")
		var opp_sexe = { $or: [{ sexe: "A Man" }, { sexe: "A Woman" }]};
	else
		var opp_sexe = { sexe: user.orientation };

	const matches = col.find({ $and: [
		opp_sexe,
		{ hash: { $ne: user.hash } },
		{ $or: [
			{ orientation: "Both" },
			{ orientation: user.sexe }
		]}
	]}).toArray();
	return matches;
};

exports.getUsersWithQuery = async (user, query) => {
	const db = await connection();
	const col = await db.collection('users');

	if (user.orientation === "Both")
		var opp_sexe = { $or: [{ sexe: "A Man" }, { sexe: "A Woman" }]};
	else
		var opp_sexe = { sexe: user.orientation };

	var sort = {}; sort[query.sort] = 1;
	console.log(query);
	const matches = await col.aggregate([
		{ $geoNear: {
			near: { type: 'Point', coordinates: user.location.coordinates },
			distanceField: 'dist.calculated',
			maxDistance: Number(query.distance),
			spherical: true
		}},
		{ $match: { $and: [ opp_sexe, { hash: { $ne: user.hash }}, { $or: [{ orientation: "Both" }, { orientation: user.sexe }] }]}},
		{ $match: {age: { $gte: query.minage, $lte: query.maxage }}},
		{ $sort: sort },
		{ $project: { hash: 1, tags: true, dist: 1, first_name: 1, _id: 0 }}
	]).toArray();
	return matches;
};

exports.getUsersByLocation = async (user, query) => {
	const db = await connection();
	const col = await db.collection('users');
	const test = await col.createIndex({ 'location.coordinates': '2dsphere' });

	if (user.orientation === "Both")
		var opp_sexe = { $or: [{ sexe: "A Man" }, { sexe: "A Woman" }]};
	else
		var opp_sexe = { sexe: user.orientation };
	const matches = await col.aggregate([
		{ $geoNear: {
			near: { type: 'Point', coordinates: user.location.coordinates },
			distanceField: 'dist.calculated',
			maxDistance: Number(query.distance),
			spherical: true
		}},
		{ $match: { $and: [ opp_sexe, { hash: { $ne: user.hash } }, { $or: [{ orientation: "Both" }, { orientation: user.sexe }] }]}},
		{ $match: {age: { $gte: query.minage, $lte: query.maxage }}},
		{ $project: { hash: 1, tags: true, _id: 0 }}
	]).toArray();
	return matches;
};

exports.writeLike = async (from, to) => {
	const db = await connection();
	const col = await db.collection('users');
	const res = await col.findOneAndUpdate(
		{ hash: to },
		{ $addToSet: { likes: from }}
	);
	if (res.value.likes && res.value.likes.indexOf(from) != -1)
		return false;
	else
		return true;
};
