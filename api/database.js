
var _ = require('underscore');
var schema = require('./schema');
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

exports.getTweetsWithLabel = function(labelExists, callback) {
	tweetModel().find({class_label: {$exists: labelExists}})
		 .exec(callback);
};

exports.searchTweets = function(searchRegex, callback) {
	tweetModel().find({text: { $regex: searchRegex, $options: 'i' }})
		 .exec(callback);
};

exports.deleteTweets = function(searchRegex, callback) {
	tweetModel().remove({text: { $regex: searchRegex, $options: 'i' }})
		 .exec(callback);
};

exports.labelTweet = function(id, class_label, callback) {
	tweetModel().findByIdAndUpdate(id, {class_label:class_label}, 
									callback);
};

exports.saveYelpBusinesses = function(yelpBizs, callback) {
	yelpBizModel().create(yelpBizs, function (err) {
		var created = _.rest(arguments);
		callback(err, created);
	});
};

exports.upsertYelpBusiness = function(yelpBiz, callback) {
	yelpBizModel().update({id: yelpBiz.id}, yelpBiz, {upsert:true}, 
						  callback);
};

exports.getYelpBusinesses = function(callback) {
    yelpBizModel().find({}, callback);
}
