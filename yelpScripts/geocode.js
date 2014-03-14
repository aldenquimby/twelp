// **************************
// ****** DEPENDENCIES ******
// **************************

var geo      = require('geo');
var _        = require('lodash');
var lazy     = require('lazy');
var fs       = require('fs');
var proc     = require('../util/process');
var database = require('../api/database');
var keys     = require('../private/keys');
var sleep    = require('sleep');
var request  = require('request');

// **************************
// ******** CONSTANTS *******
// **************************

var FROM_FILE = './private/20140311_businesses.json';

var FAILED_GEO_CODES = [
	'6122 188th St, College Point, NY, 11356',
	'870 Remsen Ave, New York, NY, 11236',
	'LaGuardia Airport Pre-Security Gate B &D, East Elmhurst, NY, 11369',
	'1609 2nd Ave between 83rd & 84th st., New York, NY, 10028',
	'At Sideshows By the Seashore & Freak Bar 1208 Surf Ave, Brooklyn, NY, 11224',
	'In Chelsea Market 75 9th Ave, New York, NY, 10011',
	'5th Ave between 16th & 17th Sts, New York, NY, 10010',
];

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
		.map(function(biz) {
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

			return { id: biz.id, toGeoCode: toGeoCode };
		})
		.filter(function(geoBiz) {
			// ignore known failures (from previous runs)
			return _.every(FAILED_GEO_CODES, function(failedGeoCode) { 
				return failedGeoCode != geoBiz.toGeoCode; 
			});
		})
		.take(2500) // google api max is 2500 per day
		.forEach(function(geoBiz) {

			var url = 'https://maps.googleapis.com/maps/api/geocode/json?key=' + keys.GOOGLE_API_KEYS[0] + '&sensor=false&address=' + geoBiz.toGeoCode;

			request(url, function(err, resp, body) {
				if (err || resp.statusCode != 200) { proc.bail('Failed to geocode address: ' + geoBiz.toGeoCode, err); }

				body = JSON.parse(body);

				if (body.status == "OK" && body.results && body.results.length > 0) {
					var result = body.results[0];
					if (result.geometry && result.geometry.location && result.geometry.location.lat) {
						var coordinate = { latitude: result.geometry.location.lat, longitude: result.geometry.location.lng };
						upsertGeoLocation(geoBiz.id, coordinate, function(err) {
							if (err) { proc.bail('Failed to upsert biz with google geocode ' + geoBiz.id, err); }
						});
					}
					else {
						console.log('NO LAT/LNG FOR: ' + geoBiz.toGeoCode);
					}
				}
				else {
					console.log('NO RESULTS FOR: ' + geoBiz.toGeoCode);
				}
			});

			return;
			geo.geocoder(geo.google, geoBiz.toGeoCode, false, function(formattedAddress, latitude, longitude, details) {
				if (!latitude || !longitude) {
					return console.log('FAILED TO GEO-CODE: ' + geoBiz.toGeoCode);
				}

				var coordinate = { latitude: latitude, longitude: longitude };
				upsertGeoLocation(geoBiz.id, coordinate, function(err) {
					if (err) { proc.bail('Failed to upsert biz with google geocode ' + geoBiz.id, err); }
				});
			});
		});
	});

});
