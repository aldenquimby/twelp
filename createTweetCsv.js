// **************************
// ******** PROCESS *********
// **************************



// **************************
// ****** DEPENDENCIES ******
// **************************

var _        = require('underscore');
var database = require('./api/database');
var schema   = require('./api/schema');
var json2csv = require('json2csv');
var fs       = require('fs');

// **************************
// ********** MAIN **********
// **************************

var outputFile = './logs/csv/test.csv';

database.connect(function() {
	console.log('Opened db connection.');

	database.findTweets({}, function(err, tweets) {
		if (err) {
			bail('Failed to get tweets.', err);
		}

		json2csv({data: tweets, fields: ['id', 'text']}, function(err, csv) {
			if (err) {
				bail('failed to convert json to csv', err);
			}
			fs.writeFile(outputFile, csv, function(err) {
				if (err) {
					bail('failed to write csv file', err);
				}
				console.log('Saved csv.');
				process.exit(0);
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
