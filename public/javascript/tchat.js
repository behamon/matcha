$(function() {
	var socket = io();
	$('#msg-form').submit(function() {
		socket.emit('message', $('#msg-input').val());
		$('#msg-input').val('');
		return false;
	});
	socket.on('message', function(msg) {
		$('.messages').append($('<span class="tag">').text(msg));
		$('.messages').append($('<br />'));
	});
});
