
var keys = require('../private/keys');
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
	searchWithParam(searchParam, callback);
};

exports.searchWithParam = function(param, callback) {
	twitter.get('search/tweets', param, callback);
};
