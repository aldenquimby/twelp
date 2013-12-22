// **************************
// ****** DEPENDENCIES ******
// **************************

var _        = require('underscore');
var database = require('../api/database'); 

// **************************
// ******** PROGRAM ********
// **************************

var getUseableMap = function(bizs) {
	
	var withTwitter = _.filter(bizs, function(biz) {
		return biz.twitter;
	});

	var seenTwitter = {};
	var bizByTwitter = {};

	_.each(withTwitter, function(biz) {
		if (seenTwitter[biz.twitter]) {
			bizByTwitter[biz.twitter] = undefined;
		} else {
			seenTwitter[biz.twitter] = true;
			bizByTwitter[biz.twitter] = biz.id;
		}
	});

	return bizByTwitter;
};

exports.analyzeTwelpMap = function(callback) {
	database.connect(function() {
		database.getYelpBusinesses(function(err, bizs) {
			if (err) {
				return callback(err);
			}

			var withSite = _.filter(bizs, function(biz) {
				return biz.site;
			});
			var withTwitter = _.filter(bizs, function(biz) {
				return biz.twitter;
			});

			var countByUsername = _.countBy(withTwitter, function(biz) {
				return biz.twitter;
			});

			var goodUsernames = [];
			var dupUsernames = [];
			_.each(_.pairs(countByUsername), function(pair) {
				if (pair[1] > 1) {
					dupUsernames.push(pair[0]);
				} else {
					goodUsernames.push(pair[0]);
				}
			});

			callback(null, {
				bizs: bizs.length,
				withSite: withSite.length,
				withTwitter: withTwitter.length,
				dupUsernames: dupUsernames.length,
				goodUsernames: goodUsernames.length
			});
		});

	}, callback);
};

exports.findTweets = function(callback) {
	database.connect(function() {
		database.getYelpBusinesses(function(err, bizs) {
			if (err) {
				return callback(err);
			}

			var map = getUseableMap(bizs);

			// console.log(JSON.stringify(map, null, 2));

			database.getTweetsWithUsers(_.keys(map), callback);
		});

	}, callback);
};