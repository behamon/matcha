const promisify = require('es6-promisify');
const hash = require('mhash');
const multer = require('multer');
const jimp = require('jimp');
const uuid = require('uuid');
const fs = require('fs');
const db = require('./dbController');


const multerOptions = {
	storage: multer.memoryStorage(),
	fileFilter(req, file, next) {
		const isPhoto = file.mimetype.startsWith('image/');
		if (isPhoto) {
			next(null, true);
		}
		else {
			next({ message: 'Wrong filetype!' }, false);
		}
	}
};

exports.editForm = async (req, res) => {
	const userdata = await db.getUser({ hash: req.params.user });
	res.render('editProfile', { title: "My Profile", userdata, which: req.params.zone });
};

exports.upload = multer(multerOptions).fields([
	{name: 'photo-1'},
	{name: 'photo-2'},
	{name: 'photo-3'},
	{name: 'photo-4'},
	{name: 'photo-5'},
]);

async function add_pic(pic, req, i) {
	const extension = pic.mimetype.split('/')[1];
	const name = `${uuid.v4()}.${extension}`;
	if (!req.body.photos)
		req.body.photos = new Array();
	req.body.photos[i] = name;
	const photo = await jimp.read(pic.buffer);
	await photo.resize(800, jimp.AUTO);
	await photo.write(`./public/users/${req.session.user}/${name}`);
}

exports.resize = async (req, res, next) => {
	const user = await db.getUser({ hash: req.params.user });
	req.body.photos = user.photos;
	for (var key in req.files) {
			var i = key.split('-')[1] - 1;
			if (fs.existsSync(`./public/users/${req.session.user}/${user.photo && user.photos[i]}`))
				fs.unlinkSync(`./public/users/${req.session.user}/${user.photo && user.photos[i]}`);
			add_pic(req.files[key][0], req, i);
	}
	next();
};

exports.editProfile = async (req, res) => {
	req.body.location.type = 'Point';
	req.body.location.coordinates = req.body.location.coordinates.map(Number);
	delete req.body.edit;
	if (!Array.isArray(req.body.tags))
		req.body.tags = [req.body.tags];
	const user = await db.updateUser({ hash: req.params.user }, { $set: req.body });
	req.flash('is-success', 'Profile Successfully Edited.');
	res.redirect('back');
};

exports.getNextPic = async (req, res) => {
	const user = await db.getUser({ hash: req.params.user });
	var n = user.photos.indexOf(req.query.act.split('/')[3]);
	res.set('Content-Type', 'text/plain');
	if (user.photos[n + 1] && req.query.which === "1")
		res.send(`/users/${user.hash}/${user.photos[n + 1]}`);
	else if (user.photos[n - 1] && req.query.which === "-1")
		res.send(`/users/${user.hash}/${user.photos[n - 1]}`);
	else
		res.send(`/users/${user.hash}/${user.photos[0]}`);
};

exports.putLike = async (req, res) => {
	const ret = await db.writeLike(req.session.user, req.body.user);
	const browser = await db.getUser({ hash: req.session.user });
	if (ret === true) {
		const target = await db.getUser({ hash: req.body.user });
		db.createConversation(
			{ hash: req.session.user },
			{ hash: req.body.user }
		);
		db.newNotif({
			viewed: false,
			hash: target.hash,
			user: `${browser.first_name} ${browser.last_name}`,
			what: "is now one of your matches! Engage conversation",
			date: new Date(Date.now() + 1000)
		});
		db.newNotif({
			viewed: false,
			hash: browser.hash,
			user: `${target.first_name} ${target.last_name}`,
			what: "is now one of your matches! Engage conversation",
			date: new Date(Date.now() + 1000)
		});
	}
	db.newNotif({
		viewed: false,
		hash: req.body.user,
		user: `${browser.first_name} ${browser.last_name}`,
		what: "liked you !",
		date: new Date(Date.now())
	});
	res.send({ status: 'is-success', msg: 'Success' });
};

exports.removeLike = async (req, res) => {
	const ret = await db.delLike(req.session.user, req.body.user);
	const browser = await db.getUser({ hash: req.session.user });
	const target = await db.getUser({ hash: req.body.user });
	db.newNotif({
		viewed: false,
		hash: target.hash,
		user: `${browser.first_name} ${browser.last_name}`,
		what: "unliked you because you suck!",
		date: new Date(Date.now())
	});
	db.deleteConversation(req.session.user, req.body.user);
	res.send({ status: 'is-success', msg: 'Successfully unliked' });
};

exports.notifs = async (req, res) => {
	const notifs = await db.getUserNotifs(req.session.user);
	res.render('notifications', { title: "Notifications", notifs });
};
