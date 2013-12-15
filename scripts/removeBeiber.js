// **************************
// ******** PROCESS *********
// **************************



// **************************
// ****** DEPENDENCIES ******
// **************************

var _        = require('underscore');
var database = require('./api/database');
var schema   = require('./api/schema');
var log      = require('./log');

// **************************
// ********* LABEL **********
// **************************

// connect to database
database.connect(function() {
	console.log('Opened db connection.');

	database.deleteTweets('bieber+', function(err, tweets) {
		if (err) {
			bail('Failed to get tweets.', err);
		}
		console.log(tweets);
		done(tweets.length);
	});

}, function(err) {
	bail('Failed to connect to db.', err);
});

bail = function(msg, err) {
	console.log(msg);
	console.log(err);
	process.exit(1);
};

done = function(msg) {
	console.log(msg);
	process.exit(0);
};
