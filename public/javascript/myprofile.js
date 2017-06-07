$(document).ready(function(){

	if (window.location.pathname.indexOf("public") > 0)
		$('#public').addClass('is-active');
	else if (window.location.pathname.indexOf("private") > 0)
		$('#private').addClass('is-active');
	else {
		$('#view').addClass('is-active');

		// TODO Try to get pics from server
		$('#pp').click(() => {
			$.get('/user')
		});
	}



	// GEOLOCATION
	//
	// if (window.location.pathname.indexOf("public") > 0) {
	//
	// 	const lat;
	// 	const lng;
	//
	// 	function showPosition(location) {
	//
	// 	};
	//
	// 	const geo = navigator.geolocation.getCurrentPosition(showPosition);
	// 	console.log(geo);
	// }

});
