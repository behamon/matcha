const db = require('../controllers/dbController');

exports = module.exports = function(io) {

	var users = {};

	io.on('connection', (socket) => {
		// console.log(`Session.user= ${socket.handshake.session.user}`);

		if (socket.handshake.session.user && socket.handshake.session.user.length > 0)
			users[socket.id] = socket.handshake.session.user;

		socket.on('disconnect', () => {
			delete users[socket.id];
			io.sockets.emit('users', users);
		});
		io.sockets.emit('users', users);

		socket.on('message', async (data) => {
			if (!data.to) {
				socket.emit('message', {
					sender: "Admin",
					msg: "Select a conversation on left panel."
				});
			} else {
				let socketId = getUserSocket(users, data.to);
				const conv = await db.getConv(data.from, data.to);
				await db.addMessage(data.msg, conv._id, data.from);
				let senderName;
				for (var key in conv) {
					if (conv[key].hash === data.from) {
						senderName = conv[key].name;
					}
				}
				socket.to(socketId).emit('message', { sender: senderName, hash: data.from, msg: data.msg });
			}
		})

		socket.on('note', (data) => {
			if (data) {
				let socketId = getUserSocket(users, data);
				if (socketId)
					socket.to(socketId).emit('notif');
			}
		});

	});

};

const getUserSocket = (users, hash) => {
	for (var user in users) {
		if (users[user] === hash)
			return user;
	}
	return false;
};
