const db = require('./dbController');

exports.showProfiles = async (req, res) => {
	const user = await db.getUser({ hash: req.session.user });
	const users = await db.getGoodProfiles(user);
	res.render('browse', { title: "Browse Profiles", users });
};

exports.showProfileSuggestions = async (req, res) => {
	const user = await db.getUser({ hash: req.session.user });
	const users = await db.getGoodProfiles(user);
	res.render('browse', { title: "Browse Profiles", users });
};

exports.showUser = async (req, res) => {
	const userdata = await db.getUser({ hash: req.params.user });
	const browser = await db.getUser({ hash: req.session.user });
	const likedByTarget = await db.likedByTarget(req.params.user, req.session.user);
	const likesTarget = await db.likesTarget(req.params.user, req.session.user);
	await db.newNotif({
		viewed: false,
		hash: userdata.hash,
		user: `${browser.first_name} ${browser.last_name}`,
		what: "visited your profile",
		date: new Date(Date.now())
	});
	res.render('userProfile', { title: userdata.first_name, userdata, likedByTarget, likesTarget });
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
	if (req.query.sort === 'tags') {
		var users = await db.getUsersWithQuery(user, req.query);
		for (var i in users)
			users[i].nbTags = countMatchingTags(user.tags, users[i].tags);
		users.sort((a, b) => { return b.nbTags - a.nbTags; })
	}
	else if (req.query.sort === 'near me') {
		var users = await db.getUsersByLocation(user, req.query);
	}
	else
		var users = await db.getUsersWithQuery(user, req.query);
	res.json(users);
};
