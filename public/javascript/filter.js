$(document).ready(function(){

	var slider = $('.slider.age')[0];
	var slider2 = $('.slider.loc')[0];

	noUiSlider.create(slider, {
		start: [18, 39],
		connect: true,
		margin: 2,
		step: 1,
		tooltips: true,
		range: {
			'min': 18,
			'max': 39
		},
		format: wNumb({ decimals: 0	})
	});

	noUiSlider.create(slider2, {
		start: 150,
		step: 1,
		tooltips: true,
		range: {
			'min': 5,
			'80%': [500, 100],
			'max': 50000
		},
		format: wNumb({ decimals: 0	})
	});

	var ageVals, locVal;
	slider.noUiSlider.on('update', () => {
		ageVals = slider.noUiSlider.get();
	});
	slider2.noUiSlider.on('update', () => {
		locVal = slider2.noUiSlider.get() * 1000;
	});

	$('#apply').click(() => {
		$('.user-box').hide(100);
		var sort_option = $('#sort option:selected').text().toLowerCase();
		$.get(`/api/search/`, {
			minage: ageVals[0],
			maxage: ageVals[1],
			distance: locVal,
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
