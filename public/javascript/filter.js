$(document).ready(function(){

	var slider = $('.slider')[0];

	noUiSlider.create(slider, {
		start: [18, 39],
		connect: true,
		margin: 2,
		step: 1,
		tooltips: true,
		range: {
			'min': 18,
			'max': 39
		}
	});

	var vals;
	slider.noUiSlider.on('update', () => {
		vals = slider.noUiSlider.get();
	});

	$('#apply').click(() => {
		$('.user-box').hide(100);
		var sort_option = $('#sort option:selected').text().toLowerCase();
		$.get(`/api/search/`, {
			minage: vals[0],
			maxage: vals[1],
			sort: sort_option
		}, function(data) {
			data.forEach((item, i, arr) => {
				if (i > 0)
					$(`#${item.hash}`).insertAfter(`#${arr[i - 1].hash}`);
				$(`#${item.hash}`).show(100);
			});
		});
	});


});
