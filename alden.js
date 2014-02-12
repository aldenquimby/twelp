// **************************
// ****** DEPENDENCIES ******
// **************************

var tm = require('./analysis/twelpMap');
var twitter = require('./api/twitterApi'); 
var _        = require('underscore');
var database = require('./api/database'); 
var lazy     = require("lazy");
var fs       = require("fs");

// **************************
// ******** PROGRAM ********
// **************************

var bail = function(msg, err) {
	console.log(msg);
	console.log(err);
	process.exit(1);
};

var done = function(msg) {
	console.log(msg || 'DONE');
	process.exit(0);
};

// count number of foursquare checkins
database.connect(function() {
	console.log('Opened db connection.');

	database.findTweets({}, function(err, tweets) {
		if (err) {
			bail('Failed to find tweets', err);
		}

		var matchingTweets = _.filter(tweets, function(tweet) {
			return tweet.urls && _.any(tweet.urls, function(url) {
				return url.toLowerCase().indexOf('foursquare') != -1;
			});
		});

		console.log(matchingTweets);
		done();
	});

}, function(err) {
	bail('Failed to connect to db.', err);
});
return;

// count tweets/sec in NYC
var start = new Date();
var count = 0;
var NYC = [ '-74', '40', '-73', '41' ];
twitter.startStream({locations: NYC}, function(tweet) {
	count++;
	if (count % 10 == 0) {
		var elapsed = new Date() - start;
		console.log(count + " tweets, " + elapsed/1000 + " s");
	}
});
return;

// analyze twelp
tm.analyzeTwelpMap(function(err, res) {
	if (err) {
		bail('', err);
	}

	console.log('TOTAL BIZS   : ' + res.bizs);
	console.log('WITH SITES   : ' + res.withSite);
	console.log('WITH TWITTER : ' + res.withTwitter);
	console.log('TWITTER DUPS : ' + res.dupUsernames);
	console.log('GOOD TWITTER : ' + res.goodUsernames);

	done();
});
return;
