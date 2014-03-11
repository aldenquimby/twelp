
var keys = require('../private/keys');
var schema = require('./schema');
var twit = require('twit');
var _    = require('lodash');
var TWITTER_KEYS = keys.TWITTER[0];
var twitter = new twit({
  consumer_key: TWITTER_KEYS.CONSUMER_KEY,
  consumer_secret: TWITTER_KEYS.CONSUMER_SECRET,
  access_token: TWITTER_KEYS.ACCESS_TOKEN,
  access_token_secret: TWITTER_KEYS.ACCESS_SECRET
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




var trackConversionImpl = function(fromTweet, numBack, callback, tweets) {

	// stop if end of convo
	if (!fromTweet.in_reply_to) {
		return callback(null, tweets);
	}

	// stop if back far enough in convo
	if (tweets.length >= numBack) {
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
		return trackConversionImpl(tweet, numBack, callback, tweets);
    });
};

exports.trackConversionBack = function(fromTweet, numBack, callback) {

	return trackConversionImpl(fromTweet, numBack, callback, []);
};




exports.userTimeline = function(user_id, since_id, max_id, callback) {

	var param = {
		user_id   : user_id,
		count     : 200,
		trim_user : true
	};
	if (since_id) {
		param.since_id = since_id;
	}
	if (max_id) {
		param.max_id = max_id;
	}

	twitter.get('statuses/user_timeline', param, function(err, resp) {
		if (err) {
			// 401 means timeline is protected
			if (err.statusCode == 401) {
				return callback(null, []);
			}
			else {
				return callback(err);
			}
		}

		var tweets = _.map(resp, schema.createTweetForDb);
		callback(null, tweets);
	});

};

