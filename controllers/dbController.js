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

exports.deleteConversation = async (user1, user2) => {
	const db = await connection();
	const users = await db.collection('users');
	const conversations = await db.collection('conversations');
	const conv = await getConv(user1, user2);
	conversations.remove(conv);
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


const getConv = async (from, to) => {
	const db = await connection();
	const conversations = await db.collection('conversations');
	const res = await conversations.findOne({ $or: [
			{ $and: [
				{ 'user0.hash': from },
				{ 'user1.hash': to }
			] },
			{ $and: [
				{ 'user0.hash': to },
				{ 'user1.hash': from }
			] }
		]
	});
	return res;
};
exports.getConv = getConv;

exports.addMessage = async (msg, conv, author) => {
	const db = await connection();
	const messages = await db.collection('messages');
	await messages.insertOne({
		msg: msg,
		conv: conv,
		author: author,
		date: new Date(Date.now())
	});
};

exports.getMessages = async (from, to) => {
	const db = await connection();
	const messages = await db.collection('messages');
	const conv = await getConv(from, to);
	const msgs = await messages
		.find({ conv: conv._id })
		.sort({ date: 1 })
		.toArray();
	msgs.unshift(conv);
	return msgs;
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
	const matches = await col.aggregate([
		{ $geoNear: {
			near: { type: 'Point', coordinates: user.location.coordinates },
			distanceField: 'dist.calculated',
			maxDistance: Number(query.distance),
			spherical: true
		}},
		{ $match: { $and: [ opp_sexe, { hash: { $ne: user.hash }}, { $or: [{ orientation: "Both" }, { orientation: user.sexe }] }]}},
		{ $match: { age: { $gte: query.minage, $lte: query.maxage }}},
		{ $match: { popularity: { $gte: Number(query.minpop), $lte: Number(query.maxpop) }}},
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
		{ $match: { popularity: { $gte: Number(query.minpop), $lte: Number(query.maxpop) }}},
		{ $project: { hash: 1, tags: true, _id: 0 }}
	]).toArray();
	return matches;
};

exports.writeLike = async (browser, target) => {
	const db = await connection();
	const col = await db.collection('users');
	const res = await col.findOneAndUpdate(
		{ hash: browser },
		{ $addToSet: { likes: target }}
	);
	const liked = await likedByTarget(target, browser);
	return liked;
};

exports.delLike = async (browser, target) => {
	const db = await connection();
	const col = await db.collection('users');
	col.findOneAndUpdate(
		{ hash: browser },
		{ $pull: { likes: target }}
	);
};

const likedByTarget = async (target, browser) => {
	const db = await connection();
	const col = await db.collection('users');
	const view = await col.findOne({ hash: target });
	if (view.likes && view.likes.indexOf(browser) != -1)
		return true;
	else
		return false;
};
exports.likedByTarget = likedByTarget;

exports.likesTarget = async (target, browser) => {
	const db = await connection();
	const col = await db.collection('users');
	const view = await col.findOne({ hash: browser });
	if (view.likes && view.likes.indexOf(target) != -1)
		return true;
	else
		return false;
};

exports.newNotif = async (notif) => {
	const db = await connection();
	const col = await db.collection('notifs');
	col.insertOne(notif);
};

exports.getUserNotifs = async (user) => {
	const db = await connection();
	const col = await db.collection('notifs');
	const notifs = await col.find({
		hash: user
	}).sort({ date: -1 }).limit(20).toArray();
	col.updateMany({ hash: user }, {
		$set: { viewed: true }
	});
	return notifs;
};

exports.addVisit = async (user) => {
	const db = await connection();
	const col = await db.collection('users');
	col.findOneAndUpdate(user, { $inc: { visits: 1 },  }, { returnOriginal: false });
};

const popScore = async () => {
	const db = await connection();
	const users = await db.collection('users');
	const ret = await users.aggregate([{ $project: { hash: 1, first_name: 1, visits: 1, likes: 1}}]).toArray();
	var max = 0;
	for (var i = 0; i < ret.length; i++) {
		let likes = await users.count({ likes: ret[i].hash });
		let total = ret[i].visits + (2 * likes);
		if (total > max) { max = total }
	}
	ret.forEach(async (user) => {
		let likes = await users.count({ likes: user.hash });
		let total = user.visits + (2 * likes);
		let score = (total * 5) / max;
		score = score.toString().substring(0, 3);
		score = parseFloat(score);
		users.update({ hash: user.hash }, { $set: { popularity: score } });
	});
};
exports.popScore = popScore;
