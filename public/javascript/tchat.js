$(document).ready(() => {

	let vars = getUrlVars();
	if (vars.to) {
		update(hash, vars.to);
		window.setInterval(function() { update(hash, vars.to) }, 4000);
	}

	$('#msg-button').click((e) => {
		var vars = getUrlVars();
		e.preventDefault();
		socket.emit('message', {
			from: window.location.pathname.split('/')[2],
			to: vars.to,
			msg: $('#msg-input').val()
		});
		$('#msg-input').val('');
	});

	socket.on('users', (data) => {
		$('.tag').each((i, tag) => {
			$(tag).removeClass('is-success');
			$(tag).addClass('is-light');
		});
		for (var elem in data) {
			if ($(`#${data[elem]}`).length) {
				$(`#${data[elem]}`).removeClass('is-light');
				$(`#${data[elem]}`).addClass('is-success');
			}
		}
	});

	socket.on('message', (data) => {
		data.msg = escapeHtml(data.msg);
		$('.table')
			.append($(`<tr><th>${data.sender}</th><td>${data.msg}</td></tr>`));
			$('.messages')[0].scrollTop = $('.messages')[0].scrollHeight;
	});

});
