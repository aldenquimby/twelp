// **************************
// ****** DEPENDENCIES ******
// **************************

var _        = require('underscore');
var twitter  = require('./api/twitterApi');
var database = require('./api/database');

// **************************
// ******** PROCESS *********
// **************************

var queries = _.rest(process.argv, 2);
if (queries.length == 0) {
	queries = ['#foodpoisoning OR #sick OR #stomachache', '"food poison"', '"food poisoning"', 'stomach', 'sick', 'vomit', 'puke', 'diarrhea', 'ill', '"the runs"'];
}

// **************************
// ******** DOWNLOAD ********
// **************************

var cities = {
	NYC: '40.6700,-73.9400,13mi',
	SF:  '37.7495,-122.4423,6mi',
	LA:  '33.9999,-118.392,23mi',
	BOS: '42.3281,-71.0644,7mi',
	CHI: '41.8607,-87.6408,16mi',
};

database.connect(function() {
	console.log('Opened db connection.');

	database.getMaxTweetId(function(err, maxId) {
		if (err) {
			bail('Database failed!', err);
		}

		// if we have a max id, this will search for all tweets since it
		// otherwise it will get all tweets in the past week, because
		// the search API only returns tweets from the past week
		console.log('Got max tweet id: ' + maxId);

		var allTweets = {};

		_.each(queries, function(query) {

			var searchParam = {
				q: query, 
				count: 100,
				lang: 'en',
				result_type: 'recent',
				geocode: cities['NYC'],
				include_entities: 1,
				since_id: maxId
			};

			// kick off search
			twitter.search(serializeQs(searchParam), function(err, tweets) {
				if (err) {
					bail('Twitter API failed!', err);
				}

				console.log(tweets.length + ' tweets from \'' + query + '\'');
				var newTweets = _.filter(tweets, function(tweet) {
					var isNew = !allTweets[tweet.id];
					allTweets[tweet.id] = tweet;
					return isNew;
				});
				database.saveTweets(newTweets, function(err2, createdTweets) {
					if (err2) {
						bail('Database failed!', err2);
					}
					console.log('Saved ' + createdTweets.length + ' tweets');
				});
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

serializeQs = function(obj) {
  var str = [];
  for(var p in obj)
     str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
  return str.join("&");
};
