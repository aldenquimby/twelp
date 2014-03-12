// **************************
// ******** PROCESS *********
// **************************



// **************************
// ****** DEPENDENCIES ******
// **************************

var _        = require('lodash');
var database = require('../api/database');
var schema   = require('../api/schema');
var log      = require('../util/log');
var proc     = require('../util/process');

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
