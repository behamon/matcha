$(document).ready(function(){

	$('#nav-toggle').click(function() {
		$('#nav-menu').toggleClass('is-active');
	});

	socket.on('message', (data) => {
		$('#nb-notif').text((i, old) => {
			return (parseInt(old) + 1);
		});
	});

	socket.on('notif', () => {
		$('#nb-notif').text((i, old) => {
			return (parseInt(old) + 1);
		});
	});

});

const update = (from, to) => {
	$.get(`/api/conv/${from}`, { to: to }, (data) => {
		data.forEach((msg, i, arr) => {
			if (i > 0) {
				const user = window.location.pathname.split('/')[2];
				if (msg.author === arr[0].user0.hash && msg.author !== user)
					msg.author = arr[0].user0.name;
				else if (msg.author === arr[0].user1.hash && msg.author !== user)
					msg.author = arr[0].user1.name;
				else
					msg.author = "You";
				msg.msg = escapeHtml(msg.msg);
				$('.table').append($(`<tr><th>${msg.author}</th><td>${msg.msg}</td></tr>`));
				$('.messages')[0].scrollTop = $('.messages')[0].scrollHeight;
			}
		});
	});
};

const getUrlVars = () => {
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++) {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}

var entityMap = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;'
};

const escapeHtml = (string) => {
  return String(string).replace(/[&<>"'`=\/]/g, function (s) {
    return entityMap[s];
  });
}
