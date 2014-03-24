// **************************
// ****** DEPENDENCIES ******
// **************************

var _        = require('lodash');
var lazy     = require('lazy');
var fs       = require('fs');
var proc     = require('../util/process');
var database = require('../api/database');

// **************************
// ******** PROGRAM ********
// **************************

var fromFile = './private/20140321_businesses.json';
var toFile = './private/yelp_businesses-' + new Date().toJSON().replace(/:|-/g, '').replace('.', '') + '.json';

database.runWithConn(function() {

	database.getYelpBusinesses({}, function(err, yelpBizs) {
		if (err) { proc.bail('Failed to get yelp bizs', err); }

		var yelpBizById = _.indexBy(yelpBizs, 'id');

		new lazy(fs.createReadStream(fromFile))
		.lines
		.map(function(line) {
			return JSON.parse(line.toString());
		})
		.map(function(biz) {
			var yelpBiz = yelpBizById[biz.id] || {geometry:{}};
			biz.twitter = yelpBiz.twitter;
			biz.coordinates = yelpBiz.geometry.coordinates;
			return _.pick(biz, 'id', 'name', 'twitter', 'coordinates');
		})
		.join(function(bizs) {
			fs.writeFile(toFile, JSON.stringify(bizs), function(err) {
				if (err) { proc.bail(err); }
				proc.done();
			});
		});

	});

});
