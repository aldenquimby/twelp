// **************************
// ****** DEPENDENCIES ******
// **************************

var _       = require('underscore');
var twitter = require('./api/twitterApi');
var logger  = require('./util/log').getFileLogger('poison-search');
var proc    = require('./util/processUtil');

// **************************
// ******** PROCESS *********
// **************************

var queries = _.rest(process.argv, 2);

// **************************
// ****** PROGRAM ******
// **************************

serializeQs = function(obj) {
  var str = [];
  for(var p in obj)
     str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
  return str.join("&");
};

var allTweets = {};

_.each(queries, function(query) {

	var searchParam = {
		q: query, 
		count: 100,
		lang: 'en',
		result_type: 'recent',
		include_entities: 1,
		geocode: '40.6700,-73.9400,13mi'
	};

	// kick off search
	twitter.search(serializeQs(searchParam), function(err, tweets) {
		if (err) { proc.bail('Twitter API failed!', err); }

		console.log('Query \'' + query + '\' returned ' + tweets.length + ' tweets');
		_.each(tweets, function(tweet) {
			if (!allTweets[tweet.id]) {
				allTweets[tweet.id] = tweet;
				logger.info(tweet);
			}
		});
		console.log('Total ' + _.values(allTweets).length + ' tweets');
	});

});
