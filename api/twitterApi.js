
var keys = require('../private/keys');
var schema = require('./schema');
var twit = require('twit');
var _    = require('underscore');
var twitter = new twit({
  consumer_key: keys.TWITTER_CONSUMER_KEY,
  consumer_secret: keys.TWITTER_CONSUMER_SECRET,
  access_token: keys.TWITTER_ACCESS_TOKEN,
  access_token_secret: keys.TWITTER_ACCESS_SECRET
});

var deserializeQs = function(query) {
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

var searchImpl = function(query, callback, tweets) {

	var param = deserializeQs(query);
	twitter.get('search/tweets', param, function(err, resp) {
		if (err) {
			return callback(err);
		}

		var newTweets = _.map(resp.statuses, schema.createTweetForDb);
		var allTweets = tweets.concat(newTweets);

		if (resp.search_metadata.next_results) {
			return searchImpl(resp.search_metadata.next_results, callback, allTweets);
		}
		else {
			return callback(null, allTweets);
		}
	});
};

exports.search = function(query, callback) {

	return searchImpl(query, callback, []);
};

exports.startStream = function(filterParam, onTweetCallback) {

	var stream = twitter.stream('statuses/filter', filterParam);
	stream.on('tweet', onTweetCallback);
	return stream;
};

var trackConversionImpl = function(fromTweet, callback, tweets) {

	if (!fromTweet.in_reply_to) {
		return callback(null, tweets);
	}

	twitter.get('/statuses/show/' + fromTweet.in_reply_to.status_id, function(err, status) {
		if (err) {
			// 404 if user deleted tweet, 403 if tweet is private
			if (err.statusCode == 404 || err.statusCode == 403) {
				return callback(null, tweets);
			}
			else {
				return callback(err);
			}
		}

		var tweet = schema.createTweetForDb(status);
		tweets.push(tweet);
		return trackConversionImpl(tweet, callback, tweets);
    });
};

exports.trackConversionBack = function(fromTweet, callback) {

	return trackConversionImpl(fromTweet, callback, []);
};


