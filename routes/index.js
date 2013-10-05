
var yelp = require('../temboo/yelp');
var twitter = require('../temboo/twitter');

exports.index = function(temboo, req, res) {
	twitter.search(function(tResp) {
		yelp.search(function(yResp) {
			res.render('index', { 
				pageTitle: 'Emdaq Games',
				siteTitle: 'Emdaq Games',
				description: 'Fullscreen, no-nonsense, classic arcade games. Built by Emdaq.',
				keywords: 'arcadegames,games',
				imageUrl: 'http://games.emdaq.com/images/facebookpic.png',
				url: 'http://games.emdaq.com',
				seeAlso: 'http://www.emdaq.com',
				yResp: yResp,
				tResp: tResp
			});
		});
	});
};