const socketio = require('socket.io');
const db = require('./dbController');

// db.createConversation(
// 	{ email: "will@smith.com" },
// 	{ email: "angelina@jolie.com" }
// );

exports.listen = (app) => {
	io = socketio.listen(app)

	io.on('connection', (socket) => {

		socket.on('message', async (data) => {
			if (!data.to) {
				socket.emit('message', {
					sender: "Admin",
					msg: "Select a conversation on left panel."
				});
			}
			else {
				const conv = await db.getConv(data.from, data.to);
				await db.addMessage(data.msg, conv._id, data.from);
				socket.emit('message', { sender: "You", msg: data.msg });
			}
		})
	});

};

// Messages controller

exports.messages = async (req, res) => {
	const userdata = await db.getUser({ hash: req.params.user });
	const userConvs = await db.getConvs(userdata);
	var toWho = [];
	if (!userConvs) {
		req.flash('is-info', 'Like users and wait for them to like back so you can talk to them !');
		res.render('noMessages', { title: 'Messages', userdata });
	}
	userConvs.forEach((conv) => {
		if (conv.user0.hash == userdata.hash)
			toWho.push(conv.user1); // maybe add convId here
		else
			toWho.push(conv.user0);
	});
	res.render('messages', { title: "Messages", hash: userdata.hash, convs: toWho });
};

exports.getConv = async (req, res) => {
	console.log(req.query);
	const messages = await db.getMessages(req.session.user, req.query.to);
	res.json(messages);
};
