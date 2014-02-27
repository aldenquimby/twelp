
var _        = require('underscore');
var Class    = require('jsclass/src/core').Class;
var database = require('./api/database');
var proc     = require('./util/proccessUtil');

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
		return 'User Timeline (back ' + timeBack + ', forward ' + timeForward + ')';
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
		return 'Conversation (back ' + numBack + ', forward ' + numForward + ')';
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

	// summary: assign a score [0, 1] for each restaurant based on the tweet and/or expandedTweetSet
	// restaurantLookup: all restaurants grouped by key {name, twitterUser}
	// returns: map from restaurant key to score [0, 1]
	restuarantSignal: function(tweet, expandedTweetSet, restaurantLookup) {

		// TODO
		return {};

	}

});

var NameMatchRestuarantSignal = new Class(RestuarantSignal, {

	// summary: assign a score [0, 1] for each restaurant based on the tweet and/or expandedTweetSet
	// restaurantLookup: all restaurants grouped by key {name, twitterUser}
	// returns: map from restaurant key to score [0, 1]
	restuarantSignal: function(tweet, expandedTweetSet, restaurantLookup) {

		// TODO
		return {};

	}

});

var FoursquareRestuarantSignal = new Class(RestuarantSignal, {

	// summary: assign a score [0, 1] for each restaurant based on the tweet and/or expandedTweetSet
	// restaurantLookup: all restaurants grouped by key {name, twitterUser}
	// returns: map from restaurant key to score [0, 1]
	restuarantSignal: function(tweet, expandedTweetSet, restaurantLookup) {

		// TODO
		return {};

	}

});

var GeoLocationRestuarantSignal = new Class(RestuarantSignal, {

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

    // returns: the name of the technique
	getName: function() {
		var name = {
			expansion : this.exapnsion.getName(),
			signal    : this.signal.getName()
		};

		return JSON.stringify(name, null, 2);
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
		return _.filter(restuarantScores, function(rs) {
			return rs.score > 0;
		});
	}

});

// do the test
var runExperiment = function(tweets, techniques, restaurantLookup) {

	var resultsByTechnique = {};
	_.each(techniques, function(tech) {
		resultsByTechnique[tech.getName()] = [];
	});

	_.each(tweets, function(tweet) {

		_.each(techniques, function(tech) {

			var result = {
				tweet: tweet
			};

			result.expandedTweetSet = tech.expandTweet(tweet);

			result.scoreLookup = tech.restuarantSignal(tweet, expandedTweetSet, restaurantLookup);

			var restuarantScores = tech.handleChainRestaurants(tweet, expandedTweetSet, restaurantLookup, scoreLookup);

			restaurantScores = tech.thresholdFilter(restuarantScores);

			result.restuarantScores = _.sortBy(restuarantScores, function(rs) {
				return -rs.score;
			});

			resultsByTechnique[tech.getName()].push(result);

		});

	});

	console.log(JSON.stringify(resultsByTechnique, null, 2));
};

database.runWithConn(function() {

	database.findTweets({}, function(err, allTweets) {
		if (err) { proc.bail('Failed to find tweets', err); }

		var tweetsById = _.indexBy(allTweets, 'id');

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
		var tweets = [];

		// all restaurants
		var restaurantLookup = {};

		// fire away
		runExperiment(tweets, techniques, restaurantLookup);

		proc.done();
	});

});
