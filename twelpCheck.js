// **************************
// ****** DEPENDENCIES ******
// **************************

var _  = require('underscore');
var proc = require('./util/processUtil');
var tm = require('./analysis/twelpMap');
var database = require('./api/database');
var twitter = require('./api/twitterApi');

// **************************
// ****** PROGRAM ******
// **************************

database.runWithConn(function() {

	tm.getAllResetaurantUsers(function(users) {
		users = _.filter(users, function (user) { 
			return user != 'dunkindonuts' 
				&& user != 'subway'
				&& user != 'starbucks'
				&& user != 'share'
				&& user != 'mcdonalds'
			;
		});

		users = _.map(users, function(user) { return '@' + user; });

		console.log(users.length);

		var start = new Date();
		var count = 0;
		twitter.startStream({track: users.join()}, function(tweet) {
			if (tweet.text.indexOf('RT ') == 0) {
				return;
			}
			var matching = _.filter(users, function(user) { return tweet.text.indexOf(user) != -1; });
			if (matching.length == 0) {
				return;
			}

			count++;
			var elapsed = new Date() - start;
			console.log(count + " tweets, " + elapsed/1000 + " s");
			console.log("MATCHES " + matching.join());
		});

	});

});


return;
tm.findTweets(function(err, tweets) {
	if (err) {
		proc.bail('Finding tweets mentioning restaurants failed.', err);
	}

	console.log(tweets);
	console.log(tweets.length);
});
