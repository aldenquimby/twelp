// **************************
// ****** DEPENDENCIES ******
// **************************

var _        = require('underscore');
var database = require('../api/database'); 

// **************************
// ******** PROGRAM ********
// **************************

var bail = function(msg, err) {
	console.log(msg);
	console.log(err);
	process.exit(1);
};

database.connect(function() {
	console.log('Opened db connection.');

	database.findTweets({}, function(err, tweets) {
		if (err) {
			bail('Failed to find tweets', err);
		}

		_.each(tweets, function(tweet) {

			var unset = {};

			if (tweet.conversation && tweet.conversation.length == 0) {
				unset.conversation = 1;
			}
			if (tweet.classification && tweet.classification.length == 0) {
				unset.classification = 1;
			}
			if (tweet.user_mentions && tweet.user_mentions.length == 0) {
				unset.user_mentions = 1;
			}
			if (tweet.urls && tweet.urls.length == 0) {
				unset.urls = 1;
			}
			if (tweet.symbols && tweet.symbols.length == 0) {
				unset.symbols = 1;
			}
			if (tweet.hashtags && tweet.hashtags.length == 0) {
				unset.hashtags = 1;
			}

			if (!_.isEmpty(unset)) {
				database.updateTweet(tweet['_id'], {'$unset': unset}, function(err2, updated) {
					if (err2) {
						bail('Updating tweet failed.', err2);
					}
					console.log('Updated ' + tweet['_id']);
				});
			}

		});
	});

}, function(err) {
	bail('Failed to connect to db.', err);
});
