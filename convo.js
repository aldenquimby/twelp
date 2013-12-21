// **************************
// ****** DEPENDENCIES ******
// **************************

var twitter  = require('./api/twitterApi');
var database = require('./api/database');
var _        = require('underscore');

// **************************
// ******** PROGRAM ********
// **************************

database.connect(function() {
	console.log('Opened db connection.');

	database.getConvoTweets(function(err, tweets) {
		console.log('TOTAL: ' + tweets.length);

		if (tweets.length == 0) {
			done();
		}

		var first = tweets[0];

		twitter.trackConversionBack(first, function(err, convo) {
			if (err) {
				bail('Convo tracking failed', err);
			}

			first.conversation = 

			database.saveTweets(convo, function(err, created) {
				if (err) {
					bail('Saving convo failed', err);
				}
				console.log('Saved convo: ' + created.length);
				done();
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
