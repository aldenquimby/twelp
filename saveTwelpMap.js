// **************************
// ****** DEPENDENCIES ******
// **************************

var _        = require('lodash');
var database = require('./api/database'); 
var lazy     = require('lazy');
var fs       = require('fs');
var link     = require('./analysis/linkTwitterYelp');

// **************************
// ******** PROGRAM ********
// **************************

var fromFile = './private/20131205_businesses.json';

database.runWithConn(function() {

	new lazy(fs.createReadStream(fromFile))
	.lines
	.skip(900)  // got blocked after 900, oops
	.take(0)
	.map(function(line) { return line.toString(); })
	.forEach(function(line) {
		var biz = JSON.parse(line.toString());
		var smallBiz = { id:biz.id, url:biz.url };

		link.twitterHandleFromYelp(biz.url, function(err, bizUrl, username) {
			if (err) {
				console.log(err);
			}
			else {
				if (bizUrl) {
					smallBiz.site = bizUrl;
				}
				if (username) {
					smallBiz.twitter = username;
				}
				database.upsertYelpBusiness(smallBiz, function(err) {
					if (err) {
						console.log(err);
					} else {
						console.log(JSON.stringify(smallBiz));
					}
				});
			}
		});
	});

});
