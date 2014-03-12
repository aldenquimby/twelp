// **************************
// ****** DEPENDENCIES ******
// **************************

var _        = require('lodash');
var database = require('../api/database'); 
var proc     = require('../util/process');

// **************************
// ******** PROGRAM ********
// **************************

database.runWithConn(function() {

	database.findTweets({}, function(err, tweets) {
		if (err) {
			proc.bail('Failed to find tweets', err);
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
						proc.bail('Updating tweet failed.', err2);
					}
					console.log('Updated ' + tweet['_id']);
				});
			}

		});
	});

});
