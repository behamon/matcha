$(document).ready(function(){

	$('#nav-toggle').click(function() {
		$('#nav-menu').toggleClass('is-active');
	})

	if (window.location.pathname.indexOf("public") > 0)
		$('#public').addClass('is-active');
	else if (window.location.pathname.indexOf("private") > 0)
		$('#private').addClass('is-active');
	else
		$('#view').addClass('is-active');

});
