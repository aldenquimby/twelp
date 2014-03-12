// **************************
// ****** DEPENDENCIES ******
// **************************

var twitter  = require('./api/twitterApi');
var database = require('./api/database');
var _        = require('lodash');
var schema   = require('./api/schema');
var proc     = require('./util/process');

// **************************
// ******** PROGRAM ********
// **************************

database.runWithConn(function() {

	database.getConvoTweets(function(err, tweets) {
		if (err) {
			proc.bail('Getting convo tweets failed', err);
		}

		console.log('CONVO TWEETS: ' + tweets.length);

		if (tweets.length == 0) {
			proc.done();
		}

		_.each(_.first(tweets, 50), function(first) {

			twitter.trackConversionBack(first, 10, function(err2, convo) {
				if (err2) {
					proc.bail('Convo tracking failed', err2);
				}

				database.updateTweet(first['_id'], {conversation: convo}, function(err3, updated) {
					if (err3) {
						proc.bail('Saving convo failed', err3);
					}
					console.log('Saved convo length ' + convo.length + ' for ' + first['_id']);
				});
			});

		});
	});

});
