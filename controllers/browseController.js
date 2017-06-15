const db = require('./dbController');


exports.showProfiles = async (req, res) => {
	const users = await db.getGoodProfiles({ hash: req.session.user });
	res.render('browse', { title: "Browse Profiles", users });
};

exports.showUser = async (req, res) => {
	const userdata = await db.getUser({ hash: req.params.user });
	res.render('userProfile', { title: userdata.first_name, userdata });
};
