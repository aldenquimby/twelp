// **************************
// ****** DEPENDENCIES ******
// **************************

var _  = require('underscore');
var tm = require('./analysis/twelpMap');

// **************************
// ****** PROGRAM ******
// **************************

bail = function(msg, err) {
	console.log(msg);
	console.log(err);
	process.exit(1);
};

tm.findTweets(function(err, tweets) {
	if (err) {
		bail('Finding tweets mentioning restaurants failed.', err);
	}

	console.log(tweets);
	console.log(tweets.length);
});
