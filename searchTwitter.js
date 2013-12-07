var query = process.argv[2];
var geocode = process.argv[3];
var _ = require('underscore');
var twitter = require('./api/twitterApi');
var schema = require('./api/schema');
var logger = require('./log').getFileLogger('poison-search');

searchTwitter = function(query) {
	var param = deserializeQs(query);
	twitter.searchWithParam(param, function(err, resp) {
		if (err) {
			bail('Twitter API failed!', err);
		}

		var tweets = _.map(resp.statuses, schema.createTweetForDb);
		console.log('Got ' + tweets.length + ' tweets');
		logger.info(tweets);
		
		// keep searching until there are no more pages
		if (resp.search_metadata.next_results) {
			searchTwitter(resp.search_metadata.next_results);
		}
		else {
			console.log('Done!');
			process.exit(0);
		}
	});
};

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
};

geocode = '40.6700,-73.9400,13mi';

var searchParam = {
	q: query || 'poison since:2013-09-01', 
	count: 100,
	lang: 'en',
	result_type: 'recent',
	include_entities: 1
};

// only add geocode if it exists
if (geocode) {
	searchParam['geocode'] = geocode;
}

// kick off search
searchTwitter(serializeQs(searchParam));
