// **************************
// ****** DEPENDENCIES ******
// **************************

var _        = require('lodash');
var fs       = require('fs');
var database = require('./api/database'); 
var proc     = require('./util/process');

// **************************
// ******** PROGRAM ********
// **************************

var fromFile = './private/yelp_businesses.json';

var bizNames = JSON.parse(fs.readFileSync(fromFile));

bizNames = _.pluck(bizNames, 'name');

bizNames = _.uniq(_.map(bizNames, function(name) { return name.toLowerCase().trim(); }));

database.runWithConn(function() {
	database.findTweets({}, function(err, tweets) {
		if (err) {
			proc.bail('Failed to find tweets', err);
		}

		tweets = _.map(tweets, function(tweet) {
			tweet.words = tweet.text.toLowerCase().split(' ');
			return tweet;
		});

		_.each(bizNames, function(name) {
			var nameParts = name.split(' ');
			var otherNameParts = name.replace("'", '').replace('-', '').split(' ');

			var matchingTweets = _.filter(tweets, function(tweet) {
				return _.difference(nameParts, tweet.words).length == 0 || 
					   _.difference(otherNameParts, tweet.words).length == 0;
			});

			if (matchingTweets.length > 0) {
				var lengthStr = matchingTweets.length < 10 ? matchingTweets.length + ' ' : matchingTweets.length;
				console.log(lengthStr + ' => ' + name);
			}
		});

	});
});
