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
		label(tweets);
	}, function(err) {
		bail('Failed to get tweets.', err);
	});
}, function(err) {
	bail('Failed to connect to db.', err);
});

label = function(tweets) {
	if (!tweets.length) {
		console.log('Done!');
		process.exit(0);
	}

	var tweet = tweets[0];
	var url = classifierUrl + encodeURIComponent(tweet.text);
	request(url, function(err, resp, body) {
		if (err || resp.statusCode != 200) {
			bail('Failed to classify tweet.', err);
		}
		var databaseId = tweet['_id'];
		var class_label = body.replace(/\s+/g, '');
		database.labelTweet(databaseId, class_label, function(updatedTweet) {
			console.log('Updated label to ' + updatedTweet.class_label);
			label(_.rest(tweets));
		}, function(err) {
			bail('Failed to save tweet.', err);
		});
	});
};

bail = function(msg, err) {
	console.log(msg);
	console.log(err);
	process.exit(1);
};
