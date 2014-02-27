// **************************
// ******** PROCESS *********
// **************************



// **************************
// ****** DEPENDENCIES ******
// **************************

var _        = require('underscore');
var database = require('../api/database');
var schema   = require('../api/schema');
var log      = require('../util/log');
var proc     = require('../util/processUtil');

// **************************
// ********* LABEL **********
// **************************

database.runWithConn(function() {
	database.deleteTweets('bieber+', function(err, tweets) {
		if (err) {
			proc.bail('Failed to get tweets.', err);
		}
		console.log(tweets);
		proc.done(tweets.length);
	});
});
