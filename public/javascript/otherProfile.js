$(document).ready(function(){

	var user = window.location.pathname.split('/')[2];

	$('#like').click(() => {
		$.post(`/api/like`, { user: user }, (data) => {
			$('#message').addClass(data.status);
			$('#message').text(data.msg);
			$('#message').removeAttr('hidden');
			if (data.status === 'is-success') {
				socket.emit('note', user);
			}
		});
	});

	socket.emit('note', user);

});
