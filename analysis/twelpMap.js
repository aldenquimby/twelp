// **************************
// ****** DEPENDENCIES ******
// **************************

var _        = require('underscore');
var database = require('../api/database'); 

// **************************
// ******** PROGRAM ********
// **************************

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

