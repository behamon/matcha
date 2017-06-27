const db = require('../controllers/dbController');


exports = module.exports = function(io) {
	io.on('connection', (socket) => {
		console.log('New Connection');
		socket.id =
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
