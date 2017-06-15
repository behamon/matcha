const socketio = require('socket.io');
const db = require('./dbController');

db.createConversation(
	{ email: "brad@pitt.com" },
	{ email: "angelina@jolie.com" }
);

exports.listen = function(app) {
	io = socketio.listen(app)

	io.on('connection', function(socket) {
	  socket.on('message', function(msg) {
			io.emit('message', msg);
	  });
	});
};

// Messages controller

exports.messages = (req, res) => {
	res.render('messages', { title: "Messages" });
};
