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

		var results = [tweet];

		var back = 0;
		while (tweet && tweet.in_reply_to && back < this.numBack) {
			tweet = this.tweetApi.getTweetById(tweet.in_reply_to.status_id);
			if (tweet) {
				results.push(tweet);
			}
			back++;
		}

		return results;
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
		var self = this;

		self.preprocessTweetSet(expandedTweetSet);

		var scoreLookup = {};

		_.each(_.pairs(restaurantLookup), function(pair) {
			var key = pair[0];
			
			var restaurantKey = {
				name       : pair[1][0].name
			  , twitter    : pair[1][0].twitter
			  , foursquare : ''
			};

			var score = self.getScore(expandedTweetSet, restaurantKey);

			if (score > 0) {
				scoreLookup[key] = score;
			}
		});

		return scoreLookup;
	},

	preprocessTweetSet: function(tweets) {
	},

	getScore: function(tweets, restaurantKey) {
	},

	// summary: scale signal based on location's distinace to twitter user
	// returns: list of { restaurantId, score }
	handleChainRestaurants: function(tweet, expandedTweetSet, restaurantLookup, scoreLookup) {
		var results = [];
		_.each(_.pairs(restaurantLookup), function(pair) {
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
	}

});

var DirectMentionRestuarantSignal = new Class(RestuarantSignal, {

    // returns: the name of the technique
	getName: function() {
		return 'direct mention';
	},

	getScore: function(tweets, restaurantKey) {

		if (restaurantKey.twitter) {

			var matchingTweets = _.filter(tweets, function(tweet) {
				return _.any(tweet.user_mentions, function(um) {
					return restaurantKey.twitter.toLowerCase() == um.screen_name.toLowerCase();
				});
			});

			if (matchingTweets.length > 0) {
				return 1;
			}
		}

		return 0;
	}

});

var NameMatchRestuarantSignal = new Class(RestuarantSignal, {

    // returns: the name of the technique
	getName: function() {
		return 'name match';
	},

	preprocessTweetSet: function(tweets) {
		var self = this;

		self.wordsByTweetId = {};

		_.each(tweets, function(tweet) {
			self.wordsByTweetId[tweet.id] = tweet.text.toLowerCase().split(' ');
		});
	},

	getScore: function(tweets, restaurantKey) {
		var self = this;

		var nameParts = restaurantKey.name.split(' ');
		var otherNameParts = restaurantKey.name.replace("'", '').replace('-', '').split(' ');

		var matchingTweets = _.filter(tweets, function(tweet) {
			var words = self.wordsByTweetId[tweet.id];
			return _.difference(nameParts, words).length == 0 || 
				   _.difference(otherNameParts, words).length == 0;
		});

		return matchingTweets.length / tweets.length;
	}

});

var FoursquareRestuarantSignal = new Class(RestuarantSignal, {

    // returns: the name of the technique
	getName: function() {
		return 'foursquare';
	},

	getScore: function(tweets, restaurantKey) {

		var nameParts = restaurantKey.name.split(' ');
		var otherNameParts = restaurantKey.name.replace("'", '').replace('-', '').split(' ');

		var matchingTweets = _.filter(tweets, function(tweet) {
			return tweet.urls && _.any(tweet.urls, function(url) {
				return url.toLowerCase().indexOf('foursquare') != -1;
			});
		});

		if (matchingTweets.length > 0) {
			console.log('OMG TWEETS HAVE FOURSQUARE!');
		}

		return 0;
		return matchingTweets.length > 0 ? 1 : 0;
	}

});

var GeoLocationRestuarantSignal = new Class(RestuarantSignal, {

    // returns: the name of the technique
	getName: function() {
		return 'geo-location';
	},

	getScore: function(tweets, restaurantKey) {
		return 0;
	},

	// summary: scale signal based on location's distinace to twitter user
	// returns: list of { restaurantId, score }
	handleChainRestaurants: function(tweet, expandedTweetSet, restaurantLookup, scoreLookup) {
		var self = this;

		var scores = [];

		if (tweet.coordinates && tweet.coordinates.coordinates && tweet.coordinates.coordinates.length > 0) {

			var tweetLon = tweet.coordinates.coordinates[0];
			var tweetLat = tweet.coordinates.coordinates[1];

			// console.log('tweetLat: ' + tweetLat + ' tweetLon: ' + tweetLon);

			_.each(_.pairs(restaurantLookup), function(pair) {

				_.each(pair[1], function(restaurant) {

					if (restaurant.coordinate.latitude && restaurant.coordinate.longitude) {

						var restLat = restaurant.coordinate.latitude;
						var restLon = restaurant.coordinate.longitude;

						// console.log('restLat: ' + restLat + ' restLon: ' + restLon);

						var distance = self.coordDistance(tweetLat, tweetLon, restLat, restLon);

						// console.log('distance: ' + distance);

						var ZERO_DIST = 25;

						var score = Math.min(1, 1-(distance-ZERO_DIST)/distance);

						scores.push({
							restaurantId : restaurant.id
						  , score        : score
						});

					}

				});
			});

		}

		return scores;
	},

	coordDistance: function(lat1,lon1,lat2,lon2) {
		var R = 6371; // Radius of the earth in km
		var dLat = this.deg2rad(lat2-lat1);  // deg2rad below
		var dLon = this.deg2rad(lon2-lon1); 
		var a = 
		Math.sin(dLat/2) * Math.sin(dLat/2) +
		Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
		Math.sin(dLon/2) * Math.sin(dLon/2)
		; 
		var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
		var d = R * c; // distance in km
		return d * 1000; // distance in m
	}, 

	deg2rad: function(deg) {
		return deg * (Math.PI/180)
	}

});

var DirectNameFoursquareRestuarantSignal = new Class(RestuarantSignal, {

    // returns: the name of the technique
	getName: function() {
		return '1/3 direct mention, 1/3 name match, 1/3 foursquare';
	},

	// summary: assign a score [0, 1] for each restaurant based on the tweet and/or expandedTweetSet
	// restaurantLookup: all restaurants grouped by key {name, twitterUser}
	// returns: map from restaurant key to score [0, 1]
	restuarantSignal: function(tweet, expandedTweetSet, restaurantLookup) {

		var directScores = new DirectMentionRestuarantSignal().restuarantSignal(tweet, expandedTweetSet, restaurantLookup);
		var nameScores = new NameMatchRestuarantSignal().restuarantSignal(tweet, expandedTweetSet, restaurantLookup);
		var foursquareScores = new FoursquareRestuarantSignal().restuarantSignal(tweet, expandedTweetSet, restaurantLookup);

		var addScoresToResult = function(result, scores, weight) {
			_.each(_.pairs(scores), function(pair) {
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
		return this.signal.handleChainRestaurants(tweet, expandedTweetSet, restaurantLookup, scoreLookup);
	},

	// summary: final filter, possibly remove weak restaurant signals
	// returns: list of { restaurantId, score }
	thresholdFilter: function(restaurantScores) {
		return _.filter(restaurantScores, function(rs) {
			return rs.score > 0.05;
		});
	}

});

// **************************
// ******** PROGRAM ********
// **************************

// do the test
var runExperiment = function(tweets, techniques, restaurantLookup, restaurantsById) {

	var result = _.map(techniques, function(tech) {

		var tweetOutput = _.map(tweets, function(tweet) {

			var expandedTweetSet = tech.expandTweet(tweet);

			var scoreLookup = tech.restuarantSignal(tweet, expandedTweetSet, restaurantLookup);

			var restaurantScores = tech.handleChainRestaurants(tweet, expandedTweetSet, restaurantLookup, scoreLookup);

			restaurantScores = tech.thresholdFilter(restaurantScores);

			restaurantScores = _.sortBy(restaurantScores, function(rs) {
				return -rs.score;
			});

			// tweak for display
			restaurantScores = _.map(restaurantScores, function(rs) {
				rs.restaurant = restaurantsById[rs.restaurantId];
				rs.restaurant.url = 'http://www.yelp.com/biz/' + rs.restaurant.id;
				rs.restaurantId = undefined;
				rs.restaurant.id = undefined;
				rs.restaurant.coordinate = undefined;
				return rs;
			});
			var displayTweet = function(tweet) {
				var date = new Date(tweet.created_at).toLocaleString();
				return {
					text : tweet.text
				  , user : tweet.user.screen_name
				  , date : date.substring(4, date.length - 15)
				}
			};

			return {
				tweet            : displayTweet(tweet)
			  , expandedTweetSet : _.map(expandedTweetSet, displayTweet)
			  , scoreLookup      : scoreLookup
			  , restaurantScores : restaurantScores
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
var restaurantsById = _.indexBy(restaurants, 'id');

// tweet API for techniques to use
var tweetApi = {
	getTweetById: function(id) {
		return tweetsById[id];
	}
};

// the techniques to test
var techniques = [
    new Technique(new UserTimelineTweetExpansion(tweetApi, 7, 7), new DirectNameFoursquareRestuarantSignal())
  , new Technique(new UserTimelineTweetExpansion(tweetApi, 7, 7), new GeoLocationRestuarantSignal())
  , new Technique(new ConversationTweetExpansion(tweetApi, 3, 3), new NameMatchRestuarantSignal())
];

// the 50 tweets to run
var tweets = _.first(allTweets, 50);

// fire away
runExperiment(tweets, techniques, restaurantLookup, restaurantsById);

proc.done();
