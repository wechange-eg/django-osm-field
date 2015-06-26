/* jQuery OSM field
	2014 by Thomas netAction Schmidt for Sinnwerkstatt
	https://www.sinnwerkstatt.com/
	MIT License */
(function($) {
	$.fn.osmfield = function() {

		return this.each(function() {
			// Create HTML elements for osmfield
			var idAttribute = $(this).attr('id');
			var idLatElement = '#' + idAttribute + '_lat';
			var idLonElement = '#' + idAttribute + '_lon';

			$(this).addClass('osmfield-input');

			// Create wrapping container
			$(this).wrap('<div class="osmfield-wrapper"></div>');
			$(this).after(' <button class="osmfield-sync">🚩</button>'+
				'<div id="'+idAttribute+'-map" class="osmfield-map"></div>');
			$(this).parent().children('button').hide();

			$(this).data('lat-element',$(idLatElement));
			$(this).data('lng-element',$(idLonElement));
			$(this).data('map-element',$('#' + idAttribute+'-map'));

			var osmfieldElement = $(this);

			// initialize Leaflet map, tile layer and marker
			var map = L.map(osmfieldElement.data('map-element')[0]).setView([0,0], 15);
			map.scrollWheelZoom.disable();
			L.tileLayer('https://otile1-s.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.jpg', {
				attribution:
					'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors,'+
					' <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>,'+
					' Imagery © <a href="http://www.mapquest.com/">Mapquest</a>',
				maxZoom: 18
			}).addTo(map);
			var marker = L.marker([0,0],{draggable:true}).addTo(map);


			osmfieldElement.parent().find('.osmfield-sync').click(function() {
				osmfieldElement.data('marker-dragged', false);
				$(this).hide();
				osmfieldElement.trigger('change');
				// Do not submit any form
				return false;
			});


			// bubble up the dom to find out language or use 'en' as default
			var lang = osmfieldElement.closest('[lang]').attr('lang');
			if (lang) {
				lang = lang.split('-');
				lang = lang[0];
			} else lang = 'en';
			osmfieldElement.data('language',lang);

			// Put description text on button instead of flag icon
			(function() {
				var text;
				switch (osmfieldElement.data('language')) {
					case 'en': text = 'apply address into map'; break;
					case 'de': text = 'Adresse in Karte übernehmen'; break;
				}
				if (text) osmfieldElement.parent().find('.osmfield-sync').text( text );
			})();

			// magic that happens when marker in map is dragged
			(function (osmfieldElement) {
				marker.on('dragend', function(event) {
					var position = event.target.getLatLng();
					map.panTo(position);

					osmfieldElement.data('lat-element').val(position.lat);
					osmfieldElement.data('lng-element').val(position.lng);

					osmfieldElement.data('marker-dragged', true);
				});
			})(osmfieldElement);


			// User enters something in INPUT field
			osmfieldElement
				.on('propertychange keyup input paste change', function() {
				if (osmfieldElement.data('marker-dragged')) {
					osmfieldElement.parent().find('.osmfield-sync').show();
				}

				// Do nothing if sync-button is visible, because then the marker has moved.
				if (osmfieldElement.parent().find('.osmfield-sync').is(':visible')) return;

				if ($(this).data('oldvalue')==$(this).val()) return;
				$(this).data('oldvalue',$(this).val());

				function search(nameInputElement) {
					var language = nameInputElement.data('language');
					var url =
						'https://nominatim.openstreetmap.org/search?json_callback=?';
					(function (osmfieldElement) {
						// We could kill previous ajax requests here.
						$.getJSON(url, {
								format: 'json',
								q: nameInputElement.val(),
								addressdetails: 0,
								'accept-language': language
							},function(data) {
							// coordinates found for this address?
							if (data.length) {
								var lat = data[0].lat;
								var lng = data[0].lon;
								var name = data[0].display_name;

								osmfieldElement.data('lat-element').val(lat);
								osmfieldElement.data('lng-element').val(lng);

								var newLatLng = new L.LatLng(lat, lng);
								marker.setLatLng(newLatLng);
								map.panTo(newLatLng);
							}

							// Show map when all coordinates are set
							if (
								osmfieldElement.data('lat-element').val() &&
								osmfieldElement.data('lng-element').val()
							 ) {
								osmfieldElement.data('map-element').slideDown(function() {
									window.dispatchEvent(new Event('resize'));
								});
							}

						});
					})(nameInputElement);
				}

				// Wait 500ms for INPUT updates until Ajax request
				clearTimeout($.data(this, 'timer'));
				var nameInputElement = $(this)
				var wait = setTimeout(function() { search(nameInputElement); }, 500);
				$(this).data('timer', wait);
			});


			// Initialize INPUT, map and data attributes
			osmfieldElement.data('map-element').hide();
			// Use start values if given
			if (
				osmfieldElement.data('lat-element').val() &&
				osmfieldElement.data('lng-element').val()) {
				var newLatLng = new L.LatLng(
					osmfieldElement.data('lat-element').val(),
					osmfieldElement.data('lng-element').val()
				);
				marker.setLatLng(newLatLng);
				map.panTo(newLatLng);

				osmfieldElement.data('map-element').slideDown(function() {
					window.dispatchEvent(new Event('resize'));
				});
			} else {
				// Maybe OpenStreetMap has coordinates or hide the map
				osmfieldElement.trigger('change');
			}


		}); // each osmfield element
	}; // jQuery plugin end
}(jQuery));

$(function() {
	$('input.osmfield').osmfield();
});
