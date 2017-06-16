const db = require('./dbController');


exports.showProfiles = async (req, res) => {
	const users = await db.getGoodProfiles({ hash: req.session.user });
	res.render('browse', { title: "Browse Profiles", users });
};

exports.showUser = async (req, res) => {
	const userdata = await db.getUser({ hash: req.params.user });
	res.render('userProfile', { title: userdata.first_name, userdata });
};

const countMatchingTags = (user, match) => {
	var count = 0;
	for (var i in user) {
		if (match.indexOf(user[i]) > -1)
			count++;
	}
	return count;
};

exports.getHashList = async (req, res) => {
	const user = await db.getUser({ hash: req.session.user });
	var users = await db.getUsersWithQuery(req.session.user, req.query);
	if (req.query.sort === 'tags') {
		for (var i in users)
			users[i].nbTags = countMatchingTags(user.tags, users[i].tags);
	}
	users.sort((a, b) => {
		return b.nbTags - a.nbTags;
	})
	res.json(users);
};
