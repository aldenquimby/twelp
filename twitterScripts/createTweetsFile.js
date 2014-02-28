// **************************
// ****** DEPENDENCIES ******
// **************************

var proc     = require('../util/processUtil'); 
var database = require('../api/database'); 
var fs       = require("fs");

// **************************
// ******** PROGRAM ********
// **************************

var toFile = './private/tweets-' + new Date().toJSON().replace(/:|-/g, '').replace('.', '') + '.json';

database.runWithConn(function() {

	database.findTweets({}, function(err, tweets) {
		if (err) { proc.bail('Failed to find tweets', err); }

		fs.writeFile(toFile, JSON.stringify(tweets), function(err) {
			if (err) { proc.bail('Failed to save file', err); }
			proc.done('Done!');
		});
	});

});
