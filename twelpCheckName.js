// **************************
// ****** DEPENDENCIES ******
// **************************

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

var fromFile = './private/20131205_businesses.json';
var toFile = './private/yelp_business_names.txt';

database.connect(function() {
	console.log('Opened db connection.');

	database.findTweets({}, function(err, tweets) {
		if (err) {
			bail('Failed to find tweets', err);
		}

		new lazy(fs.createReadStream(fromFile))
		.lines
		.map(function(line) { return line.toString(); })
		.forEach(function(line) {
			var biz = JSON.parse(line.toString());

			var nameParts = biz.name.split(' ');

			var matchingTweets = _.filter(tweets, function(tweet) {
				var tweetParts = tweet.text.split(' ');
				return _.all(tweetParts, function(part) {
					return _.contains(nameParts, part);
				});
			});

			if (matchingTweets.length > 0) {
				console.log(matchingTweets.length + ' MATCHES FOR ' + biz.name);
			}
		})
		.join(function() {
			console.log('DONE');
			process.exit(0);
      	});
	});

}, function(err) {
	bail('Failed to connect to db.', err);
});
