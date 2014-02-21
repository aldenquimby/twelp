// **************************
// ****** DEPENDENCIES ******
// **************************

var proc     = require('./util/processUtil');
var _        = require('underscore');
var database = require('./api/database'); 

// **************************
// ******** PROGRAM ********
// **************************

var getAllTweets = function(callback) {
	database.findTweets({}, function(err, tweets) {
		if (err) {
			proc.bail('Failed to find tweets', err);
		}
		callback(tweets);
	});
};

database.runWithConn(function() {
	getAllTweets(function(tweets) {

		var queries = ['#foodpoisoning', '#stomachache', '"food poison"', '"food poisoning"', 'stomach', 'vomit', 'puke', 'diarrhea', '"the runs"'];

		_.each(tweets, function(tweet) {
			var newTags = {};
			_.each(queries, function(query) {
				if (tweet.text.toLowerCase().indexOf(query.replace('"', '')) != -1) {
					newTags[query] = true;
				}
			});
			var diff = true;
			if (!tweet.tags || tweet.tags.length == 0) {
				diff = !_.isEmpty(newTags);
			}			
			else {
				var allTagsInNew = _.every(tweet.tags, function(tag) {
					return newTags[tag];
				});
				var allNewInTags = _.difference(_.keys(newTags), tweet.tags).length == 0;
				diff = !allTagsInNew || !allNewInTags;
			}

			if (diff) {
				tweet.tags = _.keys(newTags);
				database.updateTweet(tweet['_id'], {tags:tweet.tags}, function(err, updated) {
					if (err) {
						bail('Failed to update tweet', err);
					}
				});
			}
		});

		var countByTag = {'NO TAGS': 0};
		_.each(tweets, function(tweet) {
			if (tweet.tags && tweet.tags.length > 0) {
				_.each(tweet.tags, function(tag) {
					countByTag[tag] = countByTag[tag] || 0;
					countByTag[tag] = countByTag[tag] + 1;
				});
			}
			else {
				countByTag['NO TAGS'] = countByTag['NO TAGS'] + 1;
			}
		});
		console.log(countByTag);
		proc.done('DONE');
	});
});
