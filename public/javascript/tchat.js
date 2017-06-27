$(document).ready(() => {

	let connectionDot = $('<span class="tag"></span>');
	$('.panel-block').each((i, conv) => {
		$('.panel-block').append(connectionDot);
		// socket.on('user-con' (data) => {
		// 	// if (data.id == conv.id)
		// });
		connectionDot.addClass('is-success');
	});


});

// $( function() {
//
// 	let vars = getUrlVars();
// 	if (vars.to) {
// 		update(hash, vars.to);
// 		window.setInterval(function() { update(hash, vars.to) }, 4000);
// 	}
//
// 	var socket = io();
//
// 	$('#msg-button').click((e) => {
// 		var vars = getUrlVars();
// 		e.preventDefault();
// 		socket.emit('message', {
// 			from: window.location.pathname.split('/')[2],
// 			to: vars.to,
// 			msg: $('#msg-input').val()
// 		});
// 		$('#msg-input').val('');
// 	});
//
// 	socket.on('message', (data) => {
// 		data.msg = escapeHtml(data.msg);
// 		$('.table')
// 			.append($(`<tr><th>${data.sender}</th><td>${data.msg}</td></tr>`));
// 			$('.messages')[0].scrollTop = $('.messages')[0].scrollHeight;
// 	});
//
// });
//
// const update = (from, to) => {
// 	$.get(`/api/conv/${from}`, { to: to }, (data) => {
// 		data.forEach((msg, i, arr) => {
// 			if (i > 0) {
// 				const user = window.location.pathname.split('/')[2];
// 				if (msg.author === arr[0].user0.hash && msg.author !== user)
// 					msg.author = arr[0].user0.name;
// 				else if (msg.author === arr[0].user1.hash && msg.author !== user)
// 					msg.author = arr[0].user1.name;
// 				else
// 					msg.author = "You";
// 				msg.msg = escapeHtml(msg.msg);
// 				$('.table').append($(`<tr><th>${msg.author}</th><td>${msg.msg}</td></tr>`));
// 				$('.messages')[0].scrollTop = $('.messages')[0].scrollHeight;
// 			}
// 		});
// 	});
// };
//
// const getUrlVars = () => {
//     var vars = [], hash;
//     var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
//     for(var i = 0; i < hashes.length; i++) {
//         hash = hashes[i].split('=');
//         vars.push(hash[0]);
//         vars[hash[0]] = hash[1];
//     }
//     return vars;
// }
//
// var entityMap = {
//   '&': '&amp;',
//   '<': '&lt;',
//   '>': '&gt;',
//   '"': '&quot;',
//   "'": '&#39;',
//   '/': '&#x2F;',
//   '`': '&#x60;',
//   '=': '&#x3D;'
// };
//
// const escapeHtml = (string) => {
//   return String(string).replace(/[&<>"'`=\/]/g, function (s) {
//     return entityMap[s];
//   });
// }
