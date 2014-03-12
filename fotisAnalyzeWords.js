// **************************
// ****** DEPENDENCIES ******
// **************************

var _        = require('lodash');
var database = require('./api/database');
var schema   = require('./api/schema');
var log      = require('./util/log');
var proc     = require('./util/process');

// **************************
// ********* LABEL **********
// **************************

database.runWithConn(function() {

	database.getTweetsWithLabel(true, function(err, tweets) {

		if (err) { proc.bail('Failed to get tweets.', err); }

		tweets = _.filter(tweets, function(x) { return x.class_label == "food_poisoning"; });
		var texts = _.pluck(tweets, 'text');
		var allWords = texts.join(' ').replace(/[^\w\s]|_/g, '').match(/\S+/g);
		var wordCount = _.countBy(allWords, function(x){return x;});
		var ordered = _.sortBy(_.pairs(wordCount), function(pair) { return pair[1]; });
		proc.done(ordered);

	});
	
});
