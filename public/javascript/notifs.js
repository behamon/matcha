$(document).ready(function(){

	var stock = localStorage;

	stock.setItem('notifs', 0);
	$('#nb-notif').text(stock.getItem('notifs'));

	$('.date').each((i, date) => {
		$(date).text((i, old) => {
			let date = new Date(old);
			return moment(date).fromNow();
		});
	});

});
