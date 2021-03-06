
var _ = require('lodash');
var schema = require('./schema');
var proc = require('../util/process');
var keys = require('../private/keys');
var mongoose = require('mongoose'),
    db = mongoose.connection;

var tweetModel = function() { return db.model('Tweet'); };
var yelpBizModel = function () { return db.model('YelpBusiness'); };

exports.connect = function(callback, errorCallback) {
	db.on('error', errorCallback);
	db.once('open', function() {
		mongoose.model('Tweet', schema.TweetSchema);
		mongoose.model('YelpBusiness', schema.YelpBusinessSchema);
		callback();
	});
	mongoose.connect(keys.DATABASE_URL);
};

exports.runWithConn = function(callback) {
	exports.connect(function() {
		console.log('Opened db connection.');
		callback();
	}, function(err) {
		proc.bail('Failed to connect to db.', err);
	});
};

// ----------------------------
// ---------  TWEETS  ---------
// ----------------------------

exports.saveTweets = function(tweets, callback) {
	tweetModel().create(tweets, function (err) {
		var createdTweets = _.rest(arguments);
		callback(err, createdTweets);
	});
};

exports.getMaxTweetId = function(callback) {
	tweetModel().findOne()
		 .sort('-id')
		 .exec(function(err, doc) {
			var maxId = (doc || {}).id;
		 	callback(err, maxId);
		});
};

exports.findById = function(id, callback) {
	tweetModel().findById(id).exec(callback);
};

exports.deleteTweets = function(searchRegex, callback) {
	tweetModel().remove({text: { $regex: searchRegex, $options: 'i' }})
		 .exec(callback);
};

exports.updateTweet = function(id, update, callback) {
	tweetModel().findByIdAndUpdate(id, update, callback);
};

exports.findTweets = function(search, callback) {
	tweetModel().find(search).exec(callback);
};

exports.getTweetsWithUsers = function(users, callback) {
    exports.findTweets({
    	"user_mentions": { "$elemMatch": { "screen_name": { "$in": users } } }
    }, callback);
};

exports.getTweetsWithLabel = function(labelExists, callback) {
    exports.findTweets({
		class_label: {$exists: labelExists}
    }, callback);
};

exports.getConvoTweets = function(callback) {
	exports.findTweets({
		in_reply_to: { $exists: true },
		conversation: { $exists: false }
	}, callback);	
};

exports.searchTweets = function(searchRegex, callback) {
	exports.findTweets({
		text: { $regex: searchRegex, $options: 'i' }
	}, callback);
};

// ----------------------------
// --------  YELP BIZ  --------
// ----------------------------

exports.saveYelpBusinesses = function(yelpBizs, callback) {
	yelpBizModel().create(yelpBizs, function (err) {
		var created = _.rest(arguments);
		callback(err, created);
	});
};

exports.updateYelpBusiness = function(id, update, callback) {
	yelpBizModel().findByIdAndUpdate(id, update, callback);
};

exports.upsertYelpBusiness = function(id, update, callback) {
	yelpBizModel().update({id: id}, update, {upsert:true}, 
						  callback);
};

exports.getYelpBusinesses = function(search, callback) {
    yelpBizModel().find(search).exec(callback);
};
