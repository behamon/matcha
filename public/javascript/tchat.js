$( function() {

	let vars = getUrlVars();
	if (vars.to) {
		update(hash, vars.to);
	// window.setInterval(update, 10000);
	}

	var socket = io();

	$('#msg-button').click((e) => {
		var vars = getUrlVars();
		e.preventDefault();
		socket.emit('message', {
			from: window.location.pathname.split('/')[2],
			to: vars.to,
			msg: $('#msg-input').val()
		});
	});

	socket.on('message', (data) => {
		$('.table')
			.append($(`<tr><th>${data.sender}</th><td>${data.msg}</td></tr>`));
	});


});

function update(from, to) {
	$.get(`/api/conv/${from}`, { to: to }, (data) => {
		data.forEach((msg, i, arr) => {
			if (i > 0) {
				const user = window.location.pathname.split('/')[2];
				// TODO retrouver le name du user
				$('.table').append($(`<tr><th>${msg.author}</th><td>${msg.msg}</td></tr>`));
			}
		});
	});
};

function getUrlVars()
{
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}
