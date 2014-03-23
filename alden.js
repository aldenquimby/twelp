// **************************
// ****** DEPENDENCIES ******
// **************************

var tm = require('./analysis/twelpMap');
var twitter = require('./api/twitterApi'); 
var proc = require('./util/process'); 
var _        = require('lodash');
var database = require('./api/database'); 
var lazy     = require('lazy');
var fs       = require('fs');

// **************************
// ******** PROGRAM ********
// **************************

var fromFile = './private/20140321_businesses.json';

new lazy(fs.createReadStream(fromFile))
.lines
.map(function(line) { return JSON.parse(line.toString()); })
.take(10)
.forEach(function(biz) {
	biz.reviews = [];
	console.log(JSON.stringify(biz, null, 2));
});

return;

var fromFile = './private/tweets.json';

new lazy(fs.createReadStream(fromFile))
.lines
.map(function(line) { return line.toString(); })
.forEach(function(line) {
	var tweet = JSON.parse(line.toString());
	if (tweet.coordinates && tweet.coordinates.coordinates && tweet.coordinates.coordinates.length > 0) {
		console.log(JSON.stringify(tweet.coordinates.coordinates));
	}
})
.join(function() {
	proc.done('DONE');
});

return;
// count number of foursquare checkins
database.runWithConn(function() {
	
	database.findTweets({}, function(err, tweets) {
		if (err) { proc.bail('Failed to find tweets', err); }

		var matchingTweets = _.filter(tweets, function(tweet) {
			return tweet.urls && _.any(tweet.urls, function(url) {
				return url.toLowerCase().indexOf('foursquare') != -1;
			});
		});

		console.log(matchingTweets.length);
		proc.done();
	});

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
		proc.bail('', err);
	}

	console.log('TOTAL BIZS   : ' + res.bizs);
	console.log('WITH SITES   : ' + res.withSite);
	console.log('WITH TWITTER : ' + res.withTwitter);
	console.log('TWITTER DUPS : ' + res.dupUsernames);
	console.log('GOOD TWITTER : ' + res.goodUsernames);

	proc.done();
});
return;
