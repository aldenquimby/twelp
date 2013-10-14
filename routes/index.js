
var winston = require('winston');
var keys = require('../keys');
var yelp = require("yelp").createClient({
  consumer_key: keys.YELP_CONSUMER_KEY, 
  consumer_secret: keys.YELP_CONSUMER_SECRET,
  token: keys.YELP_ACCESS_TOKEN,
  token_secret: keys.YELP_ACCESS_SECRET
});
var twit = require('twit');
var twitter = new twit({
  consumer_key: keys.TWITTER_CONSUMER_KEY,
  consumer_secret: keys.TWITTER_CONSUMER_SECRET,
  access_token: keys.TWITTER_ACCESS_TOKEN,
  access_token_secret: keys.TWITTER_ACCESS_SECRET
});

exports.index = function(req, res) {
	searchTwitter(function(tResp) {
		res.json(tResp);
		//yelp.search(function(yResp) {
		//	res.render('index', { 
	//			pageTitle: 'Emdaq Games',
	//			siteTitle: 'Emdaq Games',
	//			description: 'Fullscreen, no-nonsense, classic arcade games. Built by Emdaq.',
	//			keywords: 'arcadegames,games',
	//			imageUrl: 'http://games.emdaq.com/images/facebookpic.png',
	//			url: 'http://games.emdaq.com',
	//			seeAlso: 'http://www.emdaq.com',
	//			yResp: '',
	//			tResp: JSON.stringify(tResp)
	//		});
		//});
	});
};

var stream = null;

exports.startTwitterStream = function(req, res) {
	var logFile = 'logs/poison-stream-' + new Date().toJSON().replace(/:|-/g, '').replace('.', ''); + '.json';
	winston.add(winston.transports.File, { filename: logFile })
		   .remove(winston.transports.Console);

	console.log('starting stream');

	stream = twitter.stream('statuses/filter', { 
		track: 'poison',
		language: 'en',
		locations: [ '-122.75', '36.8', '-121.75', '37.8' ]
	});

	winston.info('[');
	stream.on('tweet', function (tweet) {
		winston.info(tweet + ',');
		console.log('got new tweet');
	});

	res.send('success');
};

exports.stopTwitterStream = function(req, res) {
	if (stream) {
		console.log('stopping stream');
		stream.stop();
		winston.info(']');
	}

	res.send('success');
};

function searchTwitter(callback) {
	var logFile = 'logs/poison-search-' + new Date().toJSON().replace(/:|-/g, '').replace('.', ''); + '.json';
	winston.add(winston.transports.File, { filename: logFile })
		   .remove(winston.transports.Console);
	console.log('searching twitter');
	twitter.get('search/tweets', { 
		q: 'poison', 
		count: 100,
		lang: 'en',
		result_type: 'recent',
		geocode: '37.781157,-122.398720,5mi'
	}, function(err, reply) {
		if (err) {
			console.log('Twitter API failed!');
			console.log(err);
		} else {
			winston.info(reply);
			callback(reply);
		}
	});
}

function streamTwitter() {
	console.log('streaming twitter');
	var stream = twitter.stream('statuses/filter', { 
		track: 'poison',
		language: 'en',
		locations: [ '-122.75', '36.8', '-121.75', '37.8' ]
	});

	stream.on('tweet', function (tweet) {
	  console.log(tweet);
	});

	// save stream for later so we can close it
	req.session.stream = stream;
}

function searchYelp(callback) {
	// See http://www.yelp.com/developers/documentation/v2/search_api
	yelp.search({term: "food", location: "Montreal"}, function(error, data) {
	  console.log(error);
	  console.log(data);
	});

	// See http://www.yelp.com/developers/documentation/v2/business
	yelp.business("yelp-san-francisco", function(error, data) {
	  console.log(error);
	  console.log(data);
	});
}
