var query = process.argv[2];
var _ = require('underscore');
var twitter = require('./api/twitterApi');
var schema = require('./api/schema');
var forEachAsync = require('forEachAsync').forEachAsync;
var logger = require('./log').getFileLogger('poison-search');

var q = 'poison since:2013-09-01';
var queries = [query];

forEachAsync(queries, function(next, element, index, array) {
	searchTwitter(element, array, next);
}).then(function() {
	console.log('Done!');
});

function searchTwitter(query, queries, next) {
	var param = getParam(query);
	if (q) {
		param['q'] = q;
		q = null;
	}
	twitter.searchWithParam(param, function(err, resp) {
		if (err) {
			bail('Twitter API failed!', err);
		}
		var tweets = _.map(resp.statuses, schema.createTweetForDb);
		logger.info(tweets);
		console.log('got results');
		console.log(resp.search_metadata.next_results);
		if (resp.search_metadata.next_results) {
			queries.push(resp.search_metadata.next_results);
		}
		next();
	});
}

function bail(msg, err) {
	console.log(msg);
	console.log(err);
	process.exit(1);
}

function getParam(query) {
	a = query.substr(1).split('&');
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
