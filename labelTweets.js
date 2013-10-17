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
var request  = require('request');
var forEachAsync = require('forEachAsync').forEachAsync;

// **************************
// ********* LABEL **********
// **************************

var classifierUrl = 'http://174.129.228.98/cgi-bin/R/fp_classifier?text=';

// connect to database
dbUrl = dbUrl || require('./keys').DATABASE_URL;
database.connect(dbUrl, function() {
	console.log('Opened db connection.');

	database.getUnlabeledTweets(function(tweets) {
		console.log('Labeling ' + tweets.length + ' tweets.');

		forEachAsync(tweets, function(next, element, index, array) {
			var url = classifierUrl + encodeURIComponent(element.text);
			request(url, function(err, resp, body) {
	  			if (err || resp.statusCode != 200) {
	  				bail('Failed to classify tweet.', err);
	  			}
	  			var databaseId = element['_id'];
	  			var class_label = body.replace(/\s+/g, '');
	  			database.labelTweet(databaseId, class_label, function(updatedTweet) {
					console.log('Updated label to ' + updatedTweet.class_label);
					next();
	  			}, function(err) {
					bail('Failed to save tweet.', err);
	  			});
			});
		}).then(function() {
			console.log('Done!');
			process.exit(0);
		});

	}, function(err) {
		bail('Failed to get tweets.', err);
	});

}, function(err) {
	bail('Failed to connect to db.', err);
});

bail = function(msg, err) {
	console.log(msg);
	console.log(err);
	process.exit(1);
};
