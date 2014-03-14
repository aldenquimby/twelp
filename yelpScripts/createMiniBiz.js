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

var fromFile = './private/20140311_businesses.json';
var toFile = './private/yelp_businesses-' + new Date().toJSON().replace(/:|-/g, '').replace('.', '') + '.json';

database.runWithConn(function() {

	database.getYelpBusinesses({}, function(err, yelpBizs) {
		if (err) { proc.bail('Failed to get yelp bizs', err); }

		var twitterByYelpBiz = {};
		_.each(yelpBizs, function(yelpBiz) {
			if (yelpBiz.twitter && yelpBiz.twitter != '') {
				twitterByYelpBiz[yelpBiz.id] = yelpBiz.twitter;
			}
		});

		new lazy(fs.createReadStream(fromFile))
		.lines
		.map(function(line) {
			return JSON.parse(line.toString());
		})
		.map(function(biz) {
			biz.twitter = twitterByYelpBiz[biz.id];
			biz.coordinate = biz.location.coordinate;
			return _.pick(biz, 'id', 'name', 'twitter', 'coordinate');
		})
		.join(function(bizs) {
			fs.writeFile(toFile, JSON.stringify(bizs), function(err) {
				if (err) { proc.bail(err); }
				proc.done();
			});
		});

	});

});
