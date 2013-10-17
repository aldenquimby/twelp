
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

/*
exports.findAll = function(req, res) {
	var Blog = db.model('Blog');
	Blog.find(function(err, blogs) {
		if (err) {
			console.error(err);
			return res.send(404, 'Error 404: No blogs found');
		}

		res.json(blogs);
	});
}

exports.findById = function(req, res) {
	var Blog = db.model('Blog');
	Blog.findById(req.params.id, function (err, blog) {
		if (err) {
			console.error(err);
			return res.send(404, 'Error 404: No blog found. ' + err);
		}

		res.json(blog);
	});
}

exports.create = function(req, res) {
	var Blog = db.model('Blog');

	if(!req.body.hasOwnProperty('title') ||
	   !req.body.hasOwnProperty('author') || 
	   !req.body.hasOwnProperty('body')) {
		return res.send(400, 'Error 400: Post syntax incorrect.');
	}

	var newBlog = new Blog({
		title: req.body.title,
		author: req.body.author,
		body: req.body.body,
		comments: [],
		hidden: null,
		meta: null
	});

	newBlog.save(function (err, created) {
		if (err) {
			console.error(err);
			return res.send(500, 'Error 500: Failed to create blog.');
		}

		res.json(201, created);
	});
}

exports.remove = function(req, res) {
	var Blog = db.model('Blog');
	Blog.findByIdAndRemove(req.params.id, function(err, blog) {
		if (err) {
			console.error(err);
			return res.send(404, 'Error 404: No blog found');
		}
			
		res.json(true);
	});
}

exports.update = function(req, res) {
	var Blog = db.model('Blog');

	var updatedBlog = {};

	if (req.body.hasOwnProperty('title')) {
		updatedBlog.title = req.body.title;
	}
	if (req.body.hasOwnProperty('author')) {
		updatedBlog.author = req.body.author;
	}
	if (req.body.hasOwnProperty('body')) {
		updatedBlog.body = req.body.body;
	}
	if (req.body.hasOwnProperty('comments')) {
		updatedBlog.comments = req.body.comments;
	}
	if (req.body.hasOwnProperty('hidden')) {
		updatedBlog.hidden = req.body.hidden;
	}
	if (req.body.hasOwnProperty('meta')) {
		updatedBlog.meta = req.body.meta;
	}

	Blog.findByIdAndUpdate(req.params.id, updatedBlog, function(err, blog) {
		if (err) {
			console.error(err);
			return res.send(404, 'Error 404: No blog found');
		}

		res.json(blog);
	});
}
*/