// **************************
// ****** DEPENDENCIES ******
// **************************

var _        = require('lodash');
var database = require('./api/database');
var schema   = require('./api/schema');
var request  = require('request');

// **************************
// ********* LABEL **********
// **************************

var classifierUrl = 'http://174.129.228.98/cgi-bin/R/fp_classifier?text=';

// connect to database
database.connect(function() {
	console.log('Opened db connection.');
	database.getTweetsWithLabel(false, function(err, tweets) {
		if (err) {
			bail('Failed to get tweets.', err);
		}
		console.log('Labeling ' + tweets.length + ' tweets.');
		label(tweets);
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
		database.updateTweet(databaseId, {class_label:class_label}, function(err, updated) {
			if (err) {
				bail('Failed to save tweet.', err);
			}
			console.log('Updated label to ' + updated.class_label);
			label(_.rest(tweets));
		});
	});
};

bail = function(msg, err) {
	console.log(msg);
	console.log(err);
	process.exit(1);
};
