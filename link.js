// **************************
// ****** DEPENDENCIES ******
// **************************

var _     = require('underscore');
var Class = require('jsclass/src/core').Class;
var proc  = require('./util/processUtil');
var fs    = require('fs');

// **************************
// ******* CONSTANTS ********
// **************************

var TWEETS_FILE        = './private/tweets-20140227T030314518Z.json';
var YELP_MINI_BIZ_FILE = './private/yelp_businesses.json';

// **************************
// ******** CLASSES *********
// **************************

var TweetExpansion = new Class({

    initialize: function(tweetApi) {
        this.tweetApi = tweetApi;
    },

    // returns: the name of the technique
	getName: function() {
	},

	// summary: expand tweet into set of relevant tweets
	// returns: list of tweets
	expandTweet: function(tweet) {
	},

});

var UserTimelineTweetExpansion = new Class(TweetExpansion, {

    initialize: function(tweetApi, timeBack, timeForward) {
        this.tweetApi = tweetApi;
        this.timeBack = timeBack;
        this.timeForward = timeForward;
    },

    // returns: the name of the technique
	getName: function() {
		return 'User Timeline (back ' + this.timeBack + ', forward ' + this.timeForward + ')';
	},

	// summary: expand tweet into set of relevant tweets
	// returns: list of tweets
	expandTweet: function(tweet) {
		// TODO
		return [tweet];
	}

});

var ConversationTweetExpansion = new Class(TweetExpansion, {

    initialize: function(tweetApi, numBack, numForward) {
        this.tweetApi = tweetApi;
        this.numBack = numBack;
        this.numForward = numForward;
    },

    // returns: the name of the technique
	getName: function() {
		return 'Conversation (back ' + this.numBack + ', forward ' + this.numForward + ')';
	},

	// summary: expand tweet into set of relevant tweets
	// returns: list of tweets
	expandTweet: function(tweet) {
		// TODO
		return [tweet];
	}

});

var RestuarantSignal = new Class({

    // returns: the name of the technique
	getName: function() {
	},

	// summary: assign a score [0, 1] for each restaurant based on the tweet and/or expandedTweetSet
	// restaurantLookup: all restaurants grouped by key {name, twitterUser}
	// returns: map from restaurant key to score [0, 1]
	restuarantSignal: function(tweet, expandedTweetSet, restaurantLookup) {
	},

});

var DirectMentionRestuarantSignal = new Class(RestuarantSignal, {

    // returns: the name of the technique
	getName: function() {
		return 'direct mention';
	},

	// summary: assign a score [0, 1] for each restaurant based on the tweet and/or expandedTweetSet
	// restaurantLookup: all restaurants grouped by key {name, twitterUser}
	// returns: map from restaurant key to score [0, 1]
	restuarantSignal: function(tweet, expandedTweetSet, restaurantLookup) {

		// TODO
		return {};

	}

});

var NameMatchRestuarantSignal = new Class(RestuarantSignal, {

    // returns: the name of the technique
	getName: function() {
		return 'name match';
	},

	// summary: assign a score [0, 1] for each restaurant based on the tweet and/or expandedTweetSet
	// restaurantLookup: all restaurants grouped by key {name, twitterUser}
	// returns: map from restaurant key to score [0, 1]
	restuarantSignal: function(tweet, expandedTweetSet, restaurantLookup) {

		// TODO
		return {};

	}

});

var FoursquareRestuarantSignal = new Class(RestuarantSignal, {

    // returns: the name of the technique
	getName: function() {
		return 'foursqaure';
	},

	// summary: assign a score [0, 1] for each restaurant based on the tweet and/or expandedTweetSet
	// restaurantLookup: all restaurants grouped by key {name, twitterUser}
	// returns: map from restaurant key to score [0, 1]
	restuarantSignal: function(tweet, expandedTweetSet, restaurantLookup) {

		// TODO
		return {};

	}

});

var GeoLocationRestuarantSignal = new Class(RestuarantSignal, {

    // returns: the name of the technique
	getName: function() {
		return 'geo-location';
	},

	// summary: assign a score [0, 1] for each restaurant based on the tweet and/or expandedTweetSet
	// restaurantLookup: all restaurants grouped by key {name, twitterUser}
	// returns: map from restaurant key to score [0, 1]
	restuarantSignal: function(tweet, expandedTweetSet, restaurantLookup) {

		// TODO
		return {};

	}

});

var DirectNameFoursquareRestuarantSignal = new Class(RestuarantSignal, {

    // returns: the name of the technique
	getName: function() {
		return '1/3 direct mention, 1/3 name match, 1/3 foursqaure';
	},

	// summary: assign a score [0, 1] for each restaurant based on the tweet and/or expandedTweetSet
	// restaurantLookup: all restaurants grouped by key {name, twitterUser}
	// returns: map from restaurant key to score [0, 1]
	restuarantSignal: function(tweet, expandedTweetSet, restaurantLookup) {

		var directScores = new DirectMentionRestuarantSignal().restuarantSignal(tweet, expandedTweetSet, restaurantLookup);
		var nameScores = new NameMatchRestuarantSignal().restuarantSignal(tweet, expandedTweetSet, restaurantLookup);
		var foursquareScores = new FoursquareRestuarantSignal().restuarantSignal(tweet, expandedTweetSet, restaurantLookup);

		var addScoresToResult = function(result, scores, weight) {
			_.pairs(scores, function(pair) {
				var restKey = pair[0];
				var score = pair[1];
				result[restKey] = result[restKey] || 0;
				result[restKey] += score*weigth;
			});
		};

		var result = {};

		addScoresToResult(result, directScores, 1/3);
		addScoresToResult(result, nameScores, 1/3);
		addScoresToResult(result, foursquareScores, 1/3);

		return result;

	}

});

var Technique = new Class({

    initialize: function(exapnsion, signal) {
        this.exapnsion = exapnsion;
        this.signal = signal;
    },

    // returns: the technique info
	getInfo: function() {
		return {
			expansion : this.exapnsion.getName(),
			signal    : this.signal.getName()
		};
	},

	// summary: expand tweet into set of relevant tweets
	// returns: list of tweets
	expandTweet: function(tweet) {
		return this.exapnsion.expandTweet(tweet);
	},

	// summary: assign a score [0, 1] for each restaurant based on the tweet and/or expandedTweetSet
	// restaurantLookup: all restaurants grouped by key {name, twitterUser}
	// returns: map from restaurant key to score [0, 1]
	restuarantSignal: function(tweet, expandedTweetSet, restaurantLookup) {
		return this.signal.restuarantSignal(tweet, expandedTweetSet, restaurantLookup);
	},

	// summary: scale signal based on location's distinace to twitter user
	// returns: list of { restaurantId, score }
	handleChainRestaurants: function(tweet, expandedTweetSet, restaurantLookup, scoreLookup) {
		var results = [];
		_.pairs(restaurantLookup, function(pair) {
			var score = scoreLookup[pair[0]];
			if (score) {
				_.each(pair[1], function(restaurant) {
					results.push({
						restaurantId : restaurant.id,
						score        : score
					});
				});
			}
		});
		return results;
	},

	// summary: final filter, possibly remove weak restaurant signals
	// returns: list of { restaurantId, score }
	thresholdFilter: function(restaurantScores) {
		return _.filter(restaurantScores, function(rs) {
			return rs.score > 0;
		});
	}

});

// **************************
// ******** PROGRAM ********
// **************************

// do the test
var runExperiment = function(tweets, techniques, restaurantLookup) {

	var result = _.map(techniques, function(tech) {

		var tweetOutput = _.map(tweets, function(tweet) {

			var expandedTweetSet = tech.expandTweet(tweet);

			var scoreLookup = tech.restuarantSignal(tweet, expandedTweetSet, restaurantLookup);

			var restuarantScores = tech.handleChainRestaurants(tweet, expandedTweetSet, restaurantLookup, scoreLookup);

			restaurantScores = tech.thresholdFilter(restuarantScores);

			restuarantScores = _.sortBy(restuarantScores, function(rs) {
				return -rs.score;
			});

			return {
				tweet            : tweet,
				expandedTweetSet : expandedTweetSet,
				scoreLookup      : scoreLookup,
				restuarantScores : restuarantScores
			};

		});

		return {
			technique : tech.getInfo(),
			results   : tweetOutput
		};

	});

	console.log(JSON.stringify(result, null, 2));
};

var restaurantKeySelector = function(restaurant) {
	return restaurant.name + '____' + restaurant.twitter;
};

// preload all tweets
var allTweets = JSON.parse(fs.readFileSync(TWEETS_FILE));
var tweetsById = _.indexBy(allTweets, 'id');

// all restaurants by key
var restaurants = JSON.parse(fs.readFileSync(YELP_MINI_BIZ_FILE));
var restaurantLookup = _.groupBy(restaurants, restaurantKeySelector);

// tweet API for techniques to use
var tweetApi = {
	getTweetById: function(id) {
		return tweetsById[id];
	}
};

// the techniques to test
var techniques = [
	new Technique(new UserTimelineTweetExpansion(tweetApi, 7, 7), new DirectNameFoursquareRestuarantSignal())
  , new Technique(new ConversationTweetExpansion(tweetApi, 3, 3), new NameMatchRestuarantSignal())
];

// the 50 tweets to run
var tweets = _.first(allTweets, 50);

// fire away
runExperiment(tweets, techniques, restaurantLookup);

proc.done();
