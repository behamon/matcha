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
			}
			else {
				const conv = await db.getConv(data.from, data.to);
				await db.addMessage(data.msg, conv._id, data.from);
				socket.emit('message', { sender: "You", msg: data.msg });
			}
		})
	});

};
