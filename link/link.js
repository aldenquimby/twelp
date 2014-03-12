// **************************
// ****** DEPENDENCIES ******
// **************************

var _         = require('lodash');
var Class     = require('jsclass/src/core').Class;
var proc      = require('../util/process');
var fs        = require('fs');
var moment    = require('moment');
var exp       = require('./expansion');
var sig       = require('./signal');
var Technique = require('./technique').Technique;

// **************************
// ******* CONSTANTS ********
// **************************

var TWEETS_FILE        = './private/tweets-20140227T030314518Z.json';
var EXTRA_TWEET_FILES  = [
	'./private/extra-tweets-20140312T034623917Z.json',
	'./private/extra-tweets-20140312T171055700Z.json',
];
var YELP_MINI_BIZ_FILE = './private/yelp_businesses-20140312T131153145Z.json';

// **************************
// ******** CLASSES *********
// **************************

var RochesterTechnique = new Class(Technique, {

	initialize: function(tweetApi) {
		var fourDaysBack = new exp.UserTimelineTweetExpansion(tweetApi, 100, 0);
		var within25m = new sig.GeoLocationRestuarantSignal(25);
		this.callSuper(fourDaysBack, within25m);
	},

	// no threshold here, just the geo-location
	thresholdFilter: function(restaurantScores) {
		return restaurantScores;
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

			restaurantScores = _.sortBy(restaurantScores, function(rs) {
				return -rs.score;
			});

			restaurantScores = tech.thresholdFilter(restaurantScores);

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
				var restaurant = restaurantsById[rs.restaurantId];
				return {
					score : rs.score,
				  	name  : restaurant.name,
				  	loc   : restaurant.coordinate && restaurant.coordinate.latitude ? restaurant.coordinate : undefined,
		  			url   : 'http://www.yelp.com/biz/' + restaurant.id
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
_.each(EXTRA_TWEET_FILES, function(file) {
	var extraTweets = JSON.parse(fs.readFileSync(file));
	_.each(extraTweets, function(tweet) {
		tweetsById[tweet.id] = tweet;
	});
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

// the tweets to run
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
  '399762201252478976',

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
];
var tweets = _.map(tweetIds, function(id) { return tweetsById[id]; });

// the techniques to test
var techniques = [
	new RochesterTechnique(tweetApi),
//	new Technique(new exp.UserTimelineTweetExpansion(tweetApi, 7*24, 7*24), 
//					new sig.DirectMentionRestuarantSignal()),
	new Technique(new exp.UserTimelineAndConvoTweetExpansion(tweetApi, 7*24, 7*24, 1), 
		new sig.DirectMentionRestuarantSignal()),
//	new Technique(new exp.ConversationTweetExpansion(tweetApi, 3, 3), 
//					new sig.NameMatchRestuarantSignal()),
];

// fire away
runExperiment(tweets, techniques, restaurantLookup, restaurantsById);

proc.done();
