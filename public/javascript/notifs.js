$(document).ready(function(){

	$('.date').each((i, date) => {
		$(date).text((i, old) => {
			let date = new Date(old);
			return moment(date).fromNow();
		});
	});

	$('#nb-notif').val('0');

});
