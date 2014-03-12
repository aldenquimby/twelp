// **************************
// ****** DEPENDENCIES ******
// **************************

var proc     = require('../util/process'); 
var database = require('../api/database'); 
var fs       = require('fs');
var _        = require('lodash');
var sig      = require('../link/signal')

// *********************
// ****** CONSTANTS ****
// *********************

var YELP_MINI_BIZ_FILE = './private/yelp_businesses-20140312T131153145Z.json';

// *********************
// ****** PROGRAM ******
// *********************

var viewTweets = function(tweetIds) {

	var TWEETS_FILE        = './private/tweets-20140227T030314518Z.json';
	var EXTRA_TWEET_FILES  = [
		'./private/extra-tweets-20140312T034623917Z.json',
		'./private/extra-tweets-20140312T171055700Z.json',
	];

	var allTweets = JSON.parse(fs.readFileSync(TWEETS_FILE));
	var tweetsById = _.indexBy(allTweets, 'id');
	_.each(EXTRA_TWEET_FILES, function(file) {
		var extraTweets = JSON.parse(fs.readFileSync(file));
		_.each(extraTweets, function(tweet) {
			tweetsById[tweet.id] = tweet;
		});
	});

	var daTweets = _.map(tweetIds, function(tid) { return tweetsById[tid]; });

	console.log(JSON.stringify(daTweets, null, 2));
};

return viewTweets([
  '391360858623729664',
  '404398543990820864',
  '412704735100420096',
  '412331497161752577',
  '412005092913475585',
  '414581403847000064',
  '428990485936353280',
  '431626916526055424',
  '431473811293478912',
  '428479719672016896',
  '432589718317170688',
  '432762672908488704',
  '432593558856822784',
  '436537272545325056',
  '436681039722082304',
]);

var restaurantKeySelector = function(restaurant) {
	return restaurant.name + '____' + restaurant.twitter;
};

var restaurants = JSON.parse(fs.readFileSync(YELP_MINI_BIZ_FILE));
var restaurantLookup = _.groupBy(restaurants, restaurantKeySelector);

var signal = new sig.DirectMentionRestuarantSignal();

database.runWithConn(function() {

	database.findTweets({}, function(err, tweets) {
		if (err) { proc.bail('Failed to find tweets', err); }

		_.each(tweets, function(tweet) {
			var scoreLookup = signal.restuarantSignal(tweet, [tweet], restaurantLookup);
			var scores = signal.handleChainRestaurants(tweet, [tweet], restaurantLookup, scoreLookup);
			scores = signal.thresholdFilter(scores);
			// scores is now list of { restaurantId, score }

			if (!_.isEmpty(scores)) {
				console.log(tweet.id + ' -> ' + scores.length);
			}
		});

		proc.done();

	});

});
