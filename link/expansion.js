// **************************
// ****** DEPENDENCIES ******
// **************************

var _      = require('lodash');
var Class  = require('jsclass/src/core').Class;
var moment = require('moment');

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

    initialize: function(tweetApi, hoursBack, hoursFwd) {
    	this.callSuper(tweetApi);
        this.hoursBack = hoursBack;
        this.hoursFwd = hoursFwd;
    },

    // returns: the name of the technique
	getName: function() {
		return 'User Timeline (back ' + this.displayHr(this.hoursBack) + ', forward ' + this.displayHr(this.hoursFwd) + ')';
	},

	displayHr : function(hour) {
		return (hour/24).toFixed(1);
	},

	// summary: expand tweet into set of relevant tweets
	// returns: list of tweets
	expandTweet: function(tweet) {

		var startDate = moment(tweet.created_at).subtract('hours', this.hoursBack);
		var endDate = moment(tweet.created_at).add('hours', this.hoursFwd);

		var userTweets = this.tweetApi.getTweetsByUser(tweet.user.id);

		var results = _.filter(userTweets, function(t) {
			var date = moment(t.created_at);
			return date >= startDate && date <= endDate;
		});

		if (results.length == 0) {
			console.log('NO TIMELINE EXPANSION RESULTS!');
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

    initialize: function(tweetApi, hoursBack, hoursFwd, numBack) {
        this.timelineExpansion = new UserTimelineTweetExpansion(tweetApi, hoursBack, hoursFwd);
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

});

// **************************
// ******** EXPORTS *********
// **************************

exports.UserTimelineTweetExpansion = UserTimelineTweetExpansion;
exports.ConversationTweetExpansion = ConversationTweetExpansion;
exports.UserTimelineAndConvoTweetExpansion = UserTimelineAndConvoTweetExpansion;
