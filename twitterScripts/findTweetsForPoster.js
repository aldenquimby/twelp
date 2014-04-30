// **************************
// ****** DEPENDENCIES ******
// **************************

var _        = require('lodash');
var database = require('../api/database'); 
var proc     = require('../util/process');

// **************************
// ******** PROGRAM ********
// **************************

var findInTweet = function(tweet, toFind, logTitle) {
	_.each(toFind, function(query) {
		if (tweet.text.indexOf(query) != -1) {
			console.log(logTitle + ' ' + tweet.id);
			console.log('    ' + tweet.text);
		}
	});
};

database.runWithConn(function() {

	database.findTweets({}, function(err, tweets) {
		if (err) { proc.bail('Failed to find tweets', err); }

		database.getYelpBusinesses({}, function(err, yelpBizs) {
			if (err) { proc.bail('Failed to get yelp bizs', err); }

			var yelpBizByTwitter = {};

			_.each(_.filter(yelpBizs, 'twitter'), function(biz) {
				yelpBizByTwitter[biz.twitter] = biz;
			});

			_.each(tweets, function(tweet) {

				if (!tweet.tags || tweet.tags.length == 0) {
					/*
					_.each(_.keys(yelpBizByTwitter), function(handle) {
						findInTweet(tweet, '@' + handle, 'TWEET');
					});
					*/
					findInTweet(tweet, ['chipotle', 'subway', 'taco', 'burrito', 'mcdonald'], 'TWEET');
				}

				if (tweet.conversation && tweet.conversation.length > 0) {
					_.each(tweet.conversation, function(convo) {
						/*
						_.each(_.keys(yelpBizByTwitter), function(handle) {
							findInTweet(convo, '@' + handle, 'CONVO');
						});
						*/
						findInTweet(convo, ['chipotle', 'subway', 'taco', 'burrito', 'mcdonald'], 'CONVO');
					});
				}

			});

		});

	});

});
