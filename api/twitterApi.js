
var keys = require('../keys');
var twit = require('twit');
var twitter = new twit({
  consumer_key: keys.TWITTER_CONSUMER_KEY,
  consumer_secret: keys.TWITTER_CONSUMER_SECRET,
  access_token: keys.TWITTER_ACCESS_TOKEN,
  access_token_secret: keys.TWITTER_ACCESS_SECRET
});
var stream = null;

exports.startStream = function(filterParam, onTweetCallback) {
	stream = twitter.stream('statuses/filter', filterParam);
	stream.on('tweet', onTweetCallback);
};

exports.stopStream = function() {
	if (stream) {
		stream.stop();
	}
};

exports.search = function(query, geocode, since_id, callback) {
	var searchParam = {
		q: query, 
		count: 100,
		lang: 'en',
		result_type: 'recent',
		geocode: geocode,
		include_entities: 1,
		since_id: since_id
	};
	twitter.get('search/tweets', searchParam, callback);
};

/*
exports.pageSearch = function(query, geocode, totalCount, callback) {

	// do first search
	search(query, geocode, function(err, resp) {
		if (err) {
			return callback(err, resp);
		}

		var results = resp.statuses;
		var count = resp.search_metadata.count;
		var nextQuery = resp.search_metadata.next_results || '';

		while (count < totalCount && nextQuery != '') {

			twitter.get('search/tweets' + nextQuery, {}, function() {

			});

		}

	});

	var searchParam = {
		q: query, 
		count: 100,
		lang: 'en',
		result_type: 'recent',
		geocode: geocode,
		include_entities: 1
	};



	// first search
	twitter.getElementsByTagName('')

	var count = 0;
	while (count < totalCount) {
		twitter.
	}

};

exports.nextSearch = function(queryString, callback) {
	twitter.get('search/tweets' + queryString, {}, callback);
};
*/