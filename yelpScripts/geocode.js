// **************************
// ****** DEPENDENCIES ******
// **************************

var geo      = require('geo');
var _        = require('lodash');
var lazy     = require('lazy');
var fs       = require('fs');
var proc     = require('../util/process');
var database = require('../api/database');

// **************************
// ******** CONSTANTS *******
// **************************

var FROM_FILE = './private/20140311_businesses.json';

// **************************
// ******** PROGRAM *********
// **************************

var upsertGeoLocation = function(id, coord, callback) {
	database.upsertYelpBusiness(id, {
		geometry: {
			type: 'Point',
			coordinates: [coord.longitude, coord.latitude]
		}
	}, callback);
};

database.runWithConn(function() {

	var hasGeoLoc = { "geometry.coordinates": { "$size": 2 } };

	database.getYelpBusinesses(hasGeoLoc, function(err, yelpBizs) {
		if (err) { proc.bail('Failed to get yelp bizs', err); }

		var toSkip = _.indexBy(yelpBizs, 'id');

		new lazy(fs.createReadStream(FROM_FILE))
		.lines
		.map(function(line) { 
			return JSON.parse(line.toString()); 
		})
		.filter(function(biz) {
			return !toSkip[biz.id];
		})
		.filter(function(biz) {
			// insert guys with coordinates now
			if (biz.location && biz.location.coordinate && biz.location.coordinate.latitude) {

				upsertGeoLocation(biz.id, biz.location.coordinate, function(err) {
					if (err) { proc.bail('Failed to upsert biz with coords ' + biz.id, err); }
				});

				return false;
			}

			// need to geocode other guys
			return true;
		})
//		.map(function(biz) { return true; }).join(function(bizs) { console.log(bizs.length); });
		.take(10) // google api max is 2500 per day
		.forEach(function(biz) {

			var toGeoCode = '';
			var addIfExists = function(str, separator) {
				if (str && str != '') {
					if (toGeoCode != '') {
						toGeoCode += separator;
					}
					toGeoCode += str;
				}
			};
			_.each(biz.location.address, function(a) {
				addIfExists(a, ' ');
			});
			addIfExists(biz.location.city, ', ');
			addIfExists(biz.location.state, ', ');
			addIfExists(biz.location.postal_code, ', ');

			geo.geocoder(geo.google, toGeoCode, false, function(formattedAddress, latitude, longitude, details) {
				if (!latitude || !longitude) {
					return console.log('FAILED TO GEO-CODE: ' + toGeoCode);
				}

				var coordinate = { latitude: latitude, longitude: longitude };
				upsertGeoLocation(biz.id, coordinate, function(err) {
					if (err) { proc.bail('Failed to upsert biz with google geocode ' + biz.id, err); }
				});
			});
		});
	});

});
