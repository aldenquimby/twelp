// **************************
// ****** DEPENDENCIES ******
// **************************

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

var MAX_GOOGLE_API_CALLS = 2500;

var FROM_FILE = './private/20140311_businesses.json';

var FAILED_GEO_CODES = [
	'6122 188th St, College Point, NY, 11356',
	'870 Remsen Ave, New York, NY, 11236',
	'LaGuardia Airport Pre-Security Gate B &D, East Elmhurst, NY, 11369',
	'1609 2nd Ave between 83rd & 84th st., New York, NY, 10028',
	'At Sideshows By the Seashore & Freak Bar 1208 Surf Ave, Brooklyn, NY, 11224',
	'In Chelsea Market 75 9th Ave, New York, NY, 10011',
	'5th Ave between 16th & 17th Sts, New York, NY, 10010',
	'147 Bleeker St In front of Peculiar pub/Bitter End, Manhattan, NY, 10012',
	'Waldorf Astoria 50th & Lexington Ave, New York, NY, 10022',
	'3418B Boston Rd Bet Wilson & Fish Ave, Bronx, NY, 10469',
	'850 Broadway in front of Union Square Regal Cinemas in front of Union Square Regal Cinemas, New York, NY, 10003',
	'181 Grand St Between Mulberry & Baxter Street, New York, NY, 10013',
	'861 7th Ave, New York, NY, 10019',
	'New World Mall Food Court- Stall #23 136-20 Roosevelt Ave, Flushing, NY, 11354',
	'380 Lexington Ave btwn 41st & 42nd St, New York, NY, 10168',
	'26-05 Francis Lewis Blvd, Queens, NY, 11358',
	'JFK Airport, Terminal 8 JFK Expy & S Cargo Rd, Jamaica, NY, 11430',
	'Columbus Avenue Btwn 78th & 81st St, New York, NY, 10024',
	'Whitehall St between Pearl St & Water St, New York, NY, 10004',
	'140 Broadway Between Liberty St. & Cedar St., New York, NY, 10005',
	'100 Kingston Ave bet. Bergen Street & Dean Street, Brooklyn, NY, 11216',
	'In Front of 584 Broadway between Prince & Houston, Manhattan, NY, 10012',
	'Bedford Avenue between 5th & 6th Avenue, Brooklyn, NY, 11211',
	'Between 111th & 108th on Roosevelt Ave., Corona, NY, 11368',
	'JFK International Airport, Terminal 5 JFK Expy & S Cargo Rd, Jamaica, NY, 11430',
	'35th St Btwn 5th & Madison Ave, New York, NY, 10016',
	'Abingdon Square 8th Ave & 12th St, New York, NY, 10014',
	'E 138th St between St Anns Ave & Cypress Ave, Bronx, NY, 10462',
	'Whitehall St btwn Bridge & Pearl, New York, NY, 10004',
	'Hester Street Fair Hester St & Essex St, New York, NY, 10002',
	'3rd Ave. between 59th & 58th St., New York, NY, 10022',
	'3502 Flatlands Ave Ave N & East 35th St, New York, NY, 11234',
	'1374 First Ave Between 73rd & 74th St, New York, NY, 10021',
	'205 Madison St Bet. Rutgers & Jefferson, New York, NY, 10002',
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
//		.join(function(bizs){console.log(bizs.length);});
		.take(MAX_GOOGLE_API_CALLS)
		.forEach(function(geoBiz) {

			var url = 'https://maps.googleapis.com/maps/api/geocode/json?sensor=false&address=' + geoBiz.toGeoCode;
			url += '&key=' + keys.GOOGLE_API_KEYS[0];

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
					console.log(body.status + ': ' + geoBiz.toGeoCode);
				}
			});
		});
	});

});
