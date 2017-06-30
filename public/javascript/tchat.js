$(document).ready(() => {

	var stock = localStorage;

	stock.setItem('msg', 0);
	$('#nb-msg').text(stock.getItem('msg'));

	var vars = getUrlVars();
	if (vars.to) {
		update(hash, vars.to);
	}

	$('#msg-button').click((e) => {
		e.preventDefault();
		socket.emit('message', {
			from: window.location.pathname.split('/')[2],
			to: vars.to,
			msg: $('#msg-input').val()
		});
		let msg = escapeHtml($('#msg-input').val());
		$('.table').append($(`<tr><th>You</th><td>${msg}</td></tr>`));
		$('.messages')[0].scrollTop = $('.messages')[0].scrollHeight;
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
		if (data.hash === vars.to) {
			data.msg = escapeHtml(data.msg);
			$('.table').append($(`<tr><th>${data.sender}</th><td>${data.msg}</td></tr>`));
			$('.messages')[0].scrollTop = $('.messages')[0].scrollHeight;
		}
	});

});
