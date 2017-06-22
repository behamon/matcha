$( function() {

	var socket = io();
	socket.emit('join', { hash: window.location.pathname.split('/')[2] })
	$('#msg-form').submit(() => {
		socket.emit('message', $('#msg-input').val());
		$('#msg-input').val('');
		return false;
	});

	socket.on('message', (msg) => {
		$('.messages').append($('<span class="tag">').text(msg));
		$('.messages').append($('<br />'));
	});

});
