
var _ = require('underscore');
var mongoose = require('mongoose');
var db = mongoose.connection;

exports.registerSchema = function() {
	mongoose.model('Blog', new mongoose.Schema({
	  title:  String,
	  author: String,
	  body:   String,
	  comments: [{ body: String, date: Date }],
	  date: { type: Date, default: Date.now },
	  hidden: Boolean,
	  meta: {
	    votes: Number,
	    favs:  Number
	  }
	}));
}

exports.populateSchema = function() {
	var Blog = db.model('Blog');

	var blogs = [
		new Blog({
			title:'Impossiblilty', 
			author: 'Audrey Hepburn', 
			body: "Nothing is impossible, the word itself says 'I'm possible'!"
		}),
		new Blog({
			title:'Whats up doc', 
			author: 'Walt Disney', 
			body: "You may not realize it when it happens, but a kick in the teeth may be the best thing in the world for you"
		}),
		new Blog({
			title:'Beginners', 
			author: 'Unknown', 
			body: "Even the greatest was once a beginner. Don't be afraid to take that first step."
		}),
		new Blog({
			title:'Life', 
			author: 'Neale Donald Walsch', 
			body: "You are afraid to die, and you're afraid to live. What a way to exist."
		})
	];

	_.each(blogs, function(blog) {
		blog.save(function (err) {
		  if (err) {
			console.error(err);
		  }
		  else {
		  	console.log('saved blog');
		  }
		});
	});

	console.log('populated schema');
}

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
