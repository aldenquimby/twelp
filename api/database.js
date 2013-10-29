
var _ = require('underscore');
var schema = require('./schema');
var mongoose = require('mongoose'),
    db = mongoose.connection;

exports.connect = function(dbUrl, callback, errorCallback) {
	db.on('error', errorCallback);
	db.once('open', function() {
		mongoose.model('Tweet', schema.TweetSchema);
		mongoose.model('ClassifiedTweet', schema.ClassifiedTweetSchema);
		callback();
	});
	mongoose.connect(dbUrl);
};

exports.saveTweets = function(tweets, callback, errorCallback) {
	var Tweet = db.model('Tweet');
	Tweet.create(tweets, function (err) {
		if (err) {
			errorCallback(err);
		} else {
			// all other arguments are tweets
			var createdTweets = _.rest(arguments);
			callback(createdTweets);
		}
	});
};

exports.getMaxTweetId = function(callback, errorCallback) {
	var Tweet = db.model('Tweet');
	Tweet.findOne()
		 .sort('-id')
		 .exec(function(err, doc) {
 			if (err) {
				errorCallback(err);
			} else {
				var maxId = (doc || {}).id;
    			callback(maxId);
			}
		});
};

exports.getUnlabeledTweets = function(callback, errorCallback) {
	var Tweet = db.model('Tweet');
	Tweet.find({class_label: {$exists: false}})
		 .exec(function(err, doc) {
 			if (err) {
				errorCallback(err);
			} else {
    			callback(doc);
			}
		});
};

exports.getLabeledTweets = function(callback, errorCallback) {
	var Tweet = db.model('Tweet');
	Tweet.find({class_label: {$exists: true}})
		 .exec(function(err, doc) {
 			if (err) {
				errorCallback(err);
			} else {
    			callback(doc);
			}
		});
};

exports.labelTweet = function(id, class_label, callback, errorCallback) {
	var Tweet = db.model('Tweet');
	Tweet.findByIdAndUpdate(id, {class_label:class_label}, function(err, updatedTweet) {
		if (err) {
			errorCallback(err);
		} else {
			callback(updatedTweet);
		}
	});
};
