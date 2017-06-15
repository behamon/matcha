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

	slider.noUiSlider.on('update', () => {
		var vals = slider.noUiSlider.get();
		console.log(vals);
	});

});
