$(document).ready(function(){

	var user = window.location.pathname.split('/')[2];
	var socket = io();

	$('#like').click(() => {
		$.post(`/api/like`, { user: user }, (data) => {
			$('#message').addClass(data.status);
			$('#message').append(data.msg);
			$('#message').removeAttr('hidden');
			if (data.status === 'is-success') {
				socket.emit('like', { hash: user });
			}
		});
	});

	$('#hide-message').click(() => {
		$('#message').hide();
	});


});
