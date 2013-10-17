// **************************
// ******** PROCESS *********
// **************************

var dbUrl = process.env.DATABASE_URL;
var query = process.argv[2];
var city = process.argv[3];

// **************************
// ****** DEPENDENCIES ******
// **************************

var _            = require('underscore');
var forEachAsync = require('forEachAsync').forEachAsync;
var twitter      = require('./api/twitterApi');
var database     = require('./api/database');
var schema       = require('./api/schema');

// **************************
// ******** DOWNLOAD ********
// **************************

// connect to database
dbUrl = dbUrl || require('./keys').DATABASE_URL;
database.connect(dbUrl, function() {
	console.log('opened mongo connection');
}, function(err) {
	bail('mongo connection failed', err);
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

	// if we have a max id, this will search for all tweets since it
	// otherwise it will get all tweets in the past week, because
	// the search API only returns tweets from the past week
	var searchParam = {
		q: query, 
		count: 100,
		lang: 'en',
		result_type: 'recent',
		geocode: cities[city],
		include_entities: 1,
		since_id: maxId
	};

	var queries = [serializeQs(searchParam)];
	forEachAsync(queries, function(next, element, index, array) {
		searchTwitter(element, array, next);
	}).then(function() {
		console.log('Done!');
		process.exit(0);
	});

}, function(err) {
	bail('Database failed!', err);
});

}, 2000);

searchTwitter = function(query, queries, next) {
	var param = deserializeQs(query);
	twitter.searchWithParam(param, function(err, resp) {
		if (err) {
			bail('Twitter API failed!', err);
		}

		var tweets = _.map(resp.statuses, schema.createTweetForDb);
		console.log('Got ' + tweets.length + ' tweets');
		
		database.saveTweets(tweets, function(createdTweets) {
			console.log('Saved ' + createdTweets.length + ' tweets');
			if (resp.search_metadata.next_results) {
				queries.push(resp.search_metadata.next_results);
			}
			next();
		}, function(err) {
			bail('Database failed!', err);
		});
	});
}

bail = function(msg, err) {
	console.log(msg);
	console.log(err);
	process.exit(1);
}

serializeQs = function(obj) {
  var str = [];
  for(var p in obj)
     str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
  return str.join("&");
}

deserializeQs = function(query) {
	if (query[0] == '?') {
		query = query.substr(1);
	}
	a = query.split('&');
    if (a == "") return {};
    var b = {};
    for (var i = 0; i < a.length; ++i)
    {
        var p=a[i].split('=');
        if (p.length != 2) continue;
        b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
    }
    return b;
}
