// **************************
// ****** DEPENDENCIES ******
// **************************

var _      = require('lodash');
var Class  = require('jsclass/src/core').Class;

// **************************
// ******** CLASSES *********
// **************************

var Technique = new Class({

    initialize: function(expansion, signal) {
        this.expansion = expansion;
        this.signal = signal;
    },

    // returns: the technique info
	getInfo: function() {
		return {
			expansion : this.expansion.getName(),
			signal    : this.signal.getName()
		};
	},

	// summary: expand tweet into set of relevant tweets
	// returns: list of tweets
	expandTweet: function(tweet) {
		return this.expansion.expandTweet(tweet);
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
		return this.signal.handleChainRestaurants(tweet, expandedTweetSet, restaurantLookup, scoreLookup);
	},

	// summary: final filter, possibly remove weak restaurant signals
	// returns: list of { restaurantId, score }
	thresholdFilter: function(restaurantScores) {
		var filtered = this.signal.thresholdFilter(restaurantScores);

		// just the top two for now
		return _.first(filtered, 2);
	}

});

// **************************
// ******** EXPORTS *********
// **************************

exports.Technique = Technique;
