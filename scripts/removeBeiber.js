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
var log = require('./log');

// **************************
// ********* LABEL **********
// **************************

// connect to database
dbUrl = dbUrl || require('./keys').DATABASE_URL;
database.connect(dbUrl, function() {
	console.log('Opened db connection.');

	database.deleteTweets('bieber+', function(err, tweets) {
		if (err) {
			bail('Failed to get tweets.', err);
		}

		console.log(tweets);
		done(tweets.length);

		tweets = _.filter(tweets, function(x) { return x.class_label == "food_poisoning"; });
		var texts = _.pluck(tweets, 'text');
		var allWords = texts.join(' ').replace(/[^\w\s]|_/g, '').match(/\S+/g);
		var wordCount = _.countBy(allWords, function(x){return x;});
		var ordered = _.sortBy(_.pairs(wordCount), function(pair) { return pair[1]; });
		done(ordered);
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

