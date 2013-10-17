// **************************
// ******** PROCESS *********
// **************************

var dbUrl = process.env.DATABASE_URL;
var query = process.argv[2];
var city = process.argv[3];

// **************************
// ****** DEPENDENCIES ******
// **************************

var _ = require('underscore');
var twitter = require('./api/twitterApi');
var database = require('./api/database');
var schema = require('./api/schema');

// **************************
// ******** DOWNLOAD ********
// **************************

// connect to database
dbUrl = dbUrl || require('./keys').DATABASE_URL;
database.connect(dbUrl, function() {
	console.log('opened mongo connection');
}, function(err) {
	console.log(err);
	process.exit(1);
});

// search for tweets
var cities = {
	NYC: '40.6700,-73.9400,13mi',
	SF:  '37.7495,-122.4423,6mi',
	LA:  '33.9999,-118.392,23mi',
	BOS: '42.3281,-71.0644,7mi',
	CHI: '41.8607,-87.6408,16mi',
};

setTimeout(function() {

database.getMaxTweetId(function(maxId) {
	console.log('Got max tweet id: ' + maxId);

	// if we have a max id, search for all tweets since it
	if (maxId) {

	}
	// otherwise search for all tweets from the past week
	else {
		
	}

	twitter.search(query, cities[city], maxId, function(err, reply) {
		if (err) {
			console.log('Twitter API failed!');
			console.log(err);
		} else {
			console.log('Twitter search complete.');
			var tweets = _.map(reply.statuses, schema.createTweetForDb);
			database.saveTweets(tweets, function(createdTweets) {
				console.log('Database save complete.');
				console.log(createdTweets);
				process.exit(0);
			}, function(err) {
				console.log('Database failed!');
				console.log(err);
				process.exit(1);
			});
		}
	});
}, function(err) {
	console.log('Database failed!');
	console.log(err);
	process.exit(1);
});


}, 2000);
