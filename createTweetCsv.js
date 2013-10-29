// **************************
// ******** PROCESS *********
// **************************

var dbUrl = process.env.DATABASE_URL;

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

dbUrl = dbUrl || require('./keys').DATABASE_URL;

database.connect(dbUrl, function() {
	console.log('Opened db connection.');

	database.getLabeledTweets(function(tweets) {
		json2csv({data: tweets, fields: ['id', 'text']}, function(err, csv) {
			if (err) {
				bail('failed to convert json to csv', err);
			}
			fs.writeFile('./logs/csv/test.csv', csv, function(err) {
				if (err) {
					bail('failed to write csv file', err);
				}
				console.log('Saved csv.');
				process.exit(0);
			});
		});

	}, function(err) {
		bail('Database failed!', err);
	});

}, function(err) {
	bail('mongo connection failed', err);
});

bail = function(msg, err) {
	console.log(msg);
	console.log(err);
	process.exit(1);
};
