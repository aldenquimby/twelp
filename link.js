// **************************
// ****** DEPENDENCIES ******
// **************************

var _      = require('underscore');
var Class  = require('jsclass/src/core').Class;
var proc   = require('./util/processUtil');
var fs     = require('fs');
var moment = require('moment');
var fzy    = require('./fuzzyMatching');

// **************************
// ******* CONSTANTS ********
// **************************

var TWEETS_FILE        = './private/tweets-20140227T030314518Z.json';
var TWEETS_EXTRA_FILE  = './private/extra-tweets-20140228T193033464Z.json';
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
    	this.callSuper(tweetApi);
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

		var startDate = moment(tweet.created_at).subtract('days', this.timeBack);
		var endDate = moment(tweet.created_at).add('days', this.timeForward);

		var userTweets = this.tweetApi.getTweetsByUser(tweet.user.id);

		var results = _.filter(userTweets, function(t) {
			var date = moment(t.created_at);
			return date >= startDate && date <= endDate;
		});

		if (results.length == 0) {
			proc.bail('NO TIMELINE EXPANSION RESULTS!');
		}

		return results;
	}

});

var ConversationTweetExpansion = new Class(TweetExpansion, {

    initialize: function(tweetApi, numBack, numForward) {
        this.callSuper();
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

var UserTimelineAndConvoTweetExpansion = new Class(TweetExpansion, {

    initialize: function(tweetApi, timeBack, timeForward, numBack) {
        this.timelineExpansion = new UserTimelineTweetExpansion(tweetApi, timeBack, timeForward);
        this.convoExpansion = new ConversationTweetExpansion(tweetApi, numBack, 0);
    },

    // returns: the name of the technique
	getName: function() {
		return this.timelineExpansion.getName() + ' AND ' + this.convoExpansion.getName();
	},

	// summary: expand tweet into set of relevant tweets
	// returns: list of tweets
	expandTweet: function(tweet) {
		var self = this;

		var tweets = [];

		var userTimelineTweets = self.timelineExpansion.expandTweet(tweet);

		_.each(userTimelineTweets, function(tweet) {
			var convoTweets = self.convoExpansion.expandTweet(tweet);
			tweets = tweets.concat(convoTweets);
		});

		return tweets;
	}

})

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
					if (!restaurant.id) { console.log(restaurant); }
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

	initialize: function(dist){
		this.dist = dist;
	},

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

		var scoresByRestaurant = {};

		_.each(expandedTweetSet, function(twt) {
		
			if (twt.coordinates && twt.coordinates.coordinates && twt.coordinates.coordinates.length > 0) {

				var tweetLon = twt.coordinates.coordinates[0];
				var tweetLat = twt.coordinates.coordinates[1];

				// console.log('tweetLat: ' + tweetLat + ' tweetLon: ' + tweetLon);

				_.each(_.pairs(restaurantLookup), function(pair) {

					_.each(pair[1], function(restaurant) {

						if (restaurant.coordinate && restaurant.coordinate.latitude && restaurant.coordinate.longitude) {

							var restLat = restaurant.coordinate.latitude;
							var restLon = restaurant.coordinate.longitude;

							// console.log('restLat: ' + restLat + ' restLon: ' + restLon);

							var distance = self.coordDistance(tweetLat, tweetLon, restLat, restLon);

							// console.log('distance: ' + distance);

							var score = Math.min(1, 1-(distance-self.dist)/distance);

							if (!scoresByRestaurant[restaurant.id]) {
								scoresByRestaurant[restaurant.id] = 0;
							}
							scoresByRestaurant[restaurant.id] += score;

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
				result[restKey] += score*weight;
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

var RochesterTechnique = new Class(Technique, {

	initialize: function(tweetApi) {
		var fourDaysBack = new UserTimelineTweetExpansion(tweetApi, 4, 0);
		var within25m = new GeoLocationRestuarantSignal(25);
		this.callSuper(fourDaysBack, within25m);
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
				return rs;
			});
			var displayTweet = function(tweet) {
				var date = new Date(tweet.created_at).toLocaleString();
				return {
					text : tweet.text
				  , user : tweet.user.screen_name
				  , loc  : tweet.coordinates ? tweet.coordinates.coordinates : undefined
				  , date : date.substring(4, date.length - 15)
				}
			};
			var displayScore = function(rs) {
				return {
					score      : rs.score
				  , restaurant : {
				  		name : rs.restaurant.name
		  			  , url  : rs.restaurant.url
				  }
				}
			}

			return {
				tweet            : displayTweet(tweet)
			  , expandedTweetSet : _.map(expandedTweetSet, displayTweet)
			  , scoreLookup      : scoreLookup
			  , restaurantScores : _.map(restaurantScores, displayScore)
			};

		});

		var withScores = [];
		var withoutScores = [];
		_.each(tweetOutput, function(output) {
			if (output.restaurantScores.length > 0) {
				withScores.push(output);
			} 
			else {
				withoutScores.push(output);
			}
		});

		return {
			technique     : tech.getInfo(),
			withScores    : withScores,
			withoutScores : withoutScores
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
var extraTweets = JSON.parse(fs.readFileSync(TWEETS_EXTRA_FILE));
_.each(extraTweets, function(tweet) {
	tweetsById[tweet.id] = tweet;
});
var tweetsByUser = _.groupBy(_.values(tweetsById), function(tweet) {
	return tweet.user.id;
});

// all restaurants by key
var restaurants = JSON.parse(fs.readFileSync(YELP_MINI_BIZ_FILE));
var restaurantLookup = _.groupBy(restaurants, restaurantKeySelector);
var restaurantsById = _.indexBy(restaurants, 'id');

// tweet API for techniques to use
var tweetApi = {
	getTweetById: function(id) {
		return tweetsById[id];
	},
	getTweetsByUser: function(user_id) {
		return tweetsByUser[user_id];
	}
};

// the 50 tweets to run
var tweetIds = [ 
  '399756894098583552',
  '406740861402513408',
  '411930421145128960',
  '388856429844901888',
  '388731852020023296',
  '388875184968855552',
  '389577971532443648',
  '389406738681970688',
  '388080314150440960',
  '389595163124711424',
  '391606408405209089',
  '392650394465472512',
  '400030770489614337',
  '399950310443335680',
  '399762896223469568',
  '392773439129681920',
  '399957072793436160',
  '399735229105311744',
  '400840301935620097',
  '394894910228557824',
  '395036327391268864',
  '404605402060685312',
  '413402335143288832',
  '414419186858094592',
  '389577992709873664',
  '390292076463923200',
  '389987857835626496',
  '389944864689098752',
  '389784043367067648',
  '391291944682680321',
  '392819478616354816',
  '392818178730254336',
  '394114287503171584',
  '393987387506057216',
  '390230026685513728',
  '388916528017854464',
  '388305869756456960',
  '388343665090756608',
  '388031141925515264',
  '391326865560190976',
  '392519292446851072',
  '392102868922019840',
  '391360858623729664',
  '392777612265000960',
  '393115425195585536',
  '393524319533268992',
  '393236859461312512',
  '400045084642914304',
  '399804808179105793',
  '399762201252478976' 
];
var tweets = _.map(tweetIds, function(id) { return tweetsById[id]; });

// the techniques to test
var techniques = [
	new RochesterTechnique(tweetApi)
  , new Technique(new UserTimelineTweetExpansion(tweetApi, 7, 7), new DirectMentionRestuarantSignal())
//  , new Technique(new UserTimelineAndConvoTweetExpansion(tweetApi, 7, 7, 1), new GeoLocationRestuarantSignal(25))
//  , new Technique(new ConversationTweetExpansion(tweetApi, 3, 3), new NameMatchRestuarantSignal())
];

// fire away
runExperiment(tweets, techniques, restaurantLookup, restaurantsById);

proc.done();
