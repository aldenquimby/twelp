
var log = require('../log');
var twitter = require('../api/twitterApi');
var keys = require('../keys');
var yelp = require("yelp").createClient({
  consumer_key: keys.YELP_CONSUMER_KEY, 
  consumer_secret: keys.YELP_CONSUMER_SECRET,
  token: keys.YELP_ACCESS_TOKEN,
  token_secret: keys.YELP_ACCESS_SECRET
});

exports.index = function(req, res) {
	searchTwitter(req, res);
};

exports.searchTwitter = function(req, res) {

	var logger = log.getFileLogger('poison-search');
	console.log('searching twitter');

	twitter.search('food poisoning', '37.781157,-122.398720,5mi', function(err, reply) {
		if (err) {
			console.log('Twitter API failed!');
			console.log(err);
		} else {
			logger.info(reply);
			res.json(reply);
		}
	});
};

exports.startTwitterStream = function(req, res) {
	var logger = getFileLogger('poison-stream');
	console.log('starting stream');

	twitter.startStream({ 
		track: 'poison',
		language: 'en',
		locations: [ '-122.75', '36.8', '-121.75', '37.8' ]
	}, function(tweet) {
		logger.info(tweet);
		console.log('got new tweet');
	});

	res.send('success');
};

exports.stopTwitterStream = function(req, res) {
	console.log('stopping stream');
	twitter.stopStream();
	res.send('success');
};

function getFileLogger(name) {
	var logFile = 'logs/' + name + '-' + new Date().toJSON().replace(/:|-/g, '').replace('.', '') + '.json';
	var logger = new (winston.Logger)({
	    transports: [new (winston.transports.File)({ 
	    	filename: logFile
	    })]
	});
	return logger;
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
