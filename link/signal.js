// **************************
// ****** DEPENDENCIES ******
// **************************

var _     = require('lodash');
var Class = require('jsclass/src/core').Class;
var fzy   = require('../fuzzyMatching');

// **************************
// ******** CLASSES *********
// **************************

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

		_.each(_.pairs(scoreLookup), function(pair) {
			var restaurants = restaurantLookup[pair[0]];
			var score = pair[1];
			_.each(restaurants, function(restaurant) {
				results.push({
					restaurantId : restaurant.id,
					score        : score
				});
			});
		});

		return results;
	},

	// summary: final filter, possibly remove weak restaurant signals
	// returns: list of { restaurantId, score }
	thresholdFilter: function(restaurantScores) {
		return _.filter(restaurantScores, function(rs) {
			return rs.score > 0.05;
		});
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

	// summary: assign a score [0, 1] for each restaurant based on the tweet and/or expandedTweetSet
	// restaurantLookup: all restaurants grouped by key {name, twitterUser}
	// returns: map from restaurant key to score [0, 1]
	restuarantSignal: function(tweet, expandedTweetSet, restaurantLookup) {
		var self = this;

		var keysByName = {};
		var uniqueBizNames = {};
		_.each(_.pairs(restaurantLookup), function(pair) {
			var name = pair[1][0].name;
			keysByName[name] = pair[0];
			uniqueBizNames[name] = 1;
		});
		uniqueBizNames = _.keys(uniqueBizNames);

		// map from bizName -> [ { tweet, score } ]
		var results = fzy.fuzzyMatch(uniqueBizNames, expandedTweetSet);

		// map the keys back, and sum the scores
		return _.transform(results, function(result, val, key) {
			result[keysByName[key]] = _.reduce(_.map(val, 'score'), function(sum, num) {
				return sum + num;
			});
		});
	},

	// summary: final filter, possibly remove weak restaurant signals
	// returns: list of { restaurantId, score }
	thresholdFilter: function(restaurantScores) {
		return _.filter(restaurantScores, function(rs) {
			return rs.score > 200;
		});
	},

	// methods below here aren't called

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

	initialize : function(dist) {
		this.dist = dist;
	},

    // returns: the name of the technique
	getName : function() {
		return 'geo-location';
	},

	getScore : function(tweets, restaurantKey) {
		return 0;
	},

	// summary: scale signal based on location's distinace to twitter user
	// returns: list of { restaurantId, score }
	handleChainRestaurants : function(tweet, expandedTweetSet, restaurantLookup, scoreLookup) {
		var self = this;

		var scoresByRestaurant = {};

		_.each(expandedTweetSet, function(twt) {
		
			if (twt.coordinates && twt.coordinates.coordinates && twt.coordinates.coordinates.length > 0) {

				var tweetLon = twt.coordinates.coordinates[0];
				var tweetLat = twt.coordinates.coordinates[1];

				_.each(_.pairs(restaurantLookup), function(pair) {

					_.each(pair[1], function(restaurant) {

						if (restaurant.coordinate && restaurant.coordinate.latitude && restaurant.coordinate.longitude) {

							var restLat = restaurant.coordinate.latitude;
							var restLon = restaurant.coordinate.longitude;

							var distance = self.coordDistance(tweetLat, tweetLon, restLat, restLon);

							if (distance < self.dist) {
								if (!scoresByRestaurant[restaurant.id]) {
									scoresByRestaurant[restaurant.id] = 0;
								}								
								scoresByRestaurant[restaurant.id] += 1;
							}
						}

					});
				});
			}

		});

		var results = _.map(_.pairs(scoresByRestaurant), function(pair) {
			return {
				restaurantId : pair[0]
			  , score        : pair[1]
			};
		});

		return results;
	},

	coordDistance: function(lat1,lon1,lat2,lon2) {
		var R = 6371; // Radius of the earth in km
		var dLat = this.deg2rad(lat2-lat1);  // deg2rad below
		var dLon = this.deg2rad(lon2-lon1); 
		var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
				Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
				Math.sin(dLon/2) * Math.sin(dLon/2)
		;
		var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
		return R * c * 1000; // distance in m
	}, 

	deg2rad: function(deg) {
		return deg * (Math.PI/180)
	}

});

var MultipleRestaurantSignal = new Class(RestuarantSignal, {

    // returns: the name of the technique
	getName: function() {
		var name = '';
		_.each(this.signalsWithWeights(), function(ws) {
			name += ws.weight.toFixed(1) + ' ' + ws.signal.getName() + ' ';
		});
		return name;
	},

	// returns: list of {signal, weight}
	signalsWithWeights: function() {
	},

	// summary: assign a score [0, 1] for each restaurant based on the tweet and/or expandedTweetSet
	// restaurantLookup: all restaurants grouped by key {name, twitterUser}
	// returns: map from restaurant key to score [0, 1]
	restuarantSignal: function(tweet, expandedTweetSet, restaurantLookup) {

		var addScoresToResult = function(result, scores, weight) {
			_.each(_.pairs(scores), function(pair) {
				var restKey = pair[0];
				var score = pair[1];
				result[restKey] = result[restKey] || 0;
				result[restKey] += score*weight;
			});
		};

		var result = {};

		_.each(this.signalsWithWeights(), function(ws) {
			var scores = ws.signal.restuarantSignal(tweet, expandedTweetSet, restaurantLookup);
			addScoresToResult(result, scores, ws.weight);
		});

		return result;
	}

});

var DirectNameRestuarantSignal = new Class(MultipleRestaurantSignal, {

	// returns: list of {signal, weight}
	signalsWithWeights: function() {
		return [
			{
				signal : new DirectMentionRestuarantSignal(),
				weight : 1/2
			},
			{
				signal : new NameMatchRestuarantSignal(),
				weight : 1/2
			}
		];
	}

});

var DirectNameFoursquareRestuarantSignal = new Class(MultipleRestaurantSignal, {

	// returns: list of {signal, weight}
	signalsWithWeights: function() {
		return [
			{
				signal : new DirectMentionRestuarantSignal(),
				weight : 1/3
			},
			{
				signal : new NameMatchRestuarantSignal(),
				weight : 1/3
			},
			{
				signal : new FoursquareRestuarantSignal(),
				weight : 1/3
			}
		];
	}

});

// **************************
// ******** EXPORTS *********
// **************************

exports.DirectMentionRestuarantSignal = DirectMentionRestuarantSignal;
exports.NameMatchRestuarantSignal = NameMatchRestuarantSignal;
exports.FoursquareRestuarantSignal = FoursquareRestuarantSignal;
exports.GeoLocationRestuarantSignal = GeoLocationRestuarantSignal;
exports.DirectNameRestuarantSignal = DirectNameRestuarantSignal;
exports.DirectNameFoursquareRestuarantSignal = DirectNameFoursquareRestuarantSignal;
