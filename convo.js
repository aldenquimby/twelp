// **************************
// ****** DEPENDENCIES ******
// **************************

var twitter  = require('./api/twitterApi');
var database = require('./api/database');
var _        = require('underscore');
var schema   = require('./api/schema');

// **************************
// ******** PROGRAM ********
// **************************

database.connect(function() {
	console.log('Opened db connection.');

	database.getConvoTweets(function(err, tweets) {
		if (err) {
			bail('Getting convo tweets failed', err);
		}

		console.log('CONVO TWEETS: ' + tweets.length);

		if (tweets.length == 0) {
			done();
		}

		_.each(_.first(tweets, 50), function(first) {

			twitter.trackConversionBack(first, function(err2, convo) {
				if (err2) {
					bail('Convo tracking failed', err2);
				}

				database.updateTweet(first['_id'], {conversation: convo}, function(err3, updated) {
					if (err3) {
						bail('Saving convo failed', err3);
					}
					console.log('Saved convo length ' + convo.length + ' for ' + first['_id']);
				});
			});

		});
	});

}, function(err) {
	bail('mongo connection failed', err);
});

bail = function(msg, err) {
	console.log(msg);
	console.log(err);
	process.exit(1);
};

done = function() {
	process.exit(0);
};
