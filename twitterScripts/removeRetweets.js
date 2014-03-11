// **************************
// ****** DEPENDENCIES ******
// **************************

var _        = require('lodash');
var proc     = require('../util/processUtil');
var database = require('../api/database'); 

// **************************
// ******** PROGRAM ********
// **************************

database.runWithConn(function() {
	database.deleteTweets('^RT ', function(err) {
		if (err) {
			proc.bail('Failed to delete tweets.', err);
		}
		proc.done('deleted tweets.');
	});
});
