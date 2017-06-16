function autocomplete(input, lngInput, latInput, locInput) {
	if (!input) return;
	const dropdown = new google.maps.places.Autocomplete(input[0]);

	dropdown.addListener('place_changed', () => {
		const place = dropdown.getPlace();
		latInput.value = place.geometry.location.lat();
		lngInput.value = place.geometry.location.lng();
		locInput.value = place.vicinity;
	});

	input.keydown((e) => {
		if (e.keyCode === 13)
			e.preventDefault();
	});
}

function findCity(location) {
	for (var obj in location) {
		if (location[obj].types[0].length && location[obj].types[0] == "locality") {
			return location[obj].short_name;
		}
	}
	return false;
}

function navError(err) {
	$.getJSON('//freegeoip.net/json/?callback=?', function(data) {
		if (data) {
			$('#lat')[0].value = data.latitude;
			$('#lng')[0].value = data.longitude;
			$('#loc')[0].value = data.city;
			$('#addr')[0].value = `${data.city}, ${data.country_name}`;
		}
	});
}

function navSuccess(pos) {
	$('#lat')[0].value = pos.coords.latitude;
	$('#lng')[0].value = pos.coords.longitude;

	const geo = new google.maps.Geocoder;
	const latlng = {
		lat: pos.coords.latitude,
		lng: pos.coords.longitude
	}
	geo.geocode({ location: latlng }, function(results, status) {
		if (status == 'OK') {
			$('#loc')[0].value = findCity(results[0].address_components);
			$('#addr')[0].value = results[0].formatted_address
		}
	});
}

$(document).ready(function(){

	if (window.location.pathname.indexOf("public") > 0) {
		$('#public').addClass('is-active');

		const options = {
			enableHighAccuracy: true,
  		timeout: 5000,
		};
		navigator.geolocation.getCurrentPosition(navSuccess, navError, options);
		autocomplete($('#addr'), $('#lng')[0], $('#lat')[0], $('#loc')[0]);

	}
	else if (window.location.pathname.indexOf("private") > 0)
		$('#private').addClass('is-active');
	else {
		$('#view').addClass('is-active');

		var user = window.location.pathname.split('/')[3];
		if (!user)
			var user = window.location.pathname.split('/')[2];

		$('#next').click(() => {
			$.get(`/api/pics/${user}`, { act: $('#pp').attr('src'), which: 1 }, function(data) {
					$('#pp').attr("src", data);
				});
		});
		$('#prev').click(() => {
			$.get(`/api/pics/${user}`, { act: $('#pp').attr('src'), which: -1 }, function(data) {
					$('#pp').attr("src", data);
				});
		});


	}
});
