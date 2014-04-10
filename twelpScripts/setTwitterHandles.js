// **************************
// ****** DEPENDENCIES ******
// **************************

var extractor = require('../analysis/twitterHandleExtractor.js');
var proc      = require('../util/process'); 
var _         = require('lodash');
var database  = require('../api/database'); 
var lazy      = require('lazy');
var fs        = require('fs');

// **************************
// ******** PROGRAM ********
// **************************

var fromFile = './private/yelp/20140408_businesses.json';

database.runWithConn(function() {

	new lazy(fs.createReadStream(fromFile))
	.lines
	.map(function(line) { return JSON.parse(line.toString()); })
	.forEach(function(biz) {
		var id = biz.id;
		var url = biz.business_url;

		if (url && url != '') {

			extractor.twitterHandleFromBiz(url, function(err, username) {
				if (err) {
					console.log(err);
				}
				else if (username) {
					console.log(id + ' ---> ' + username);

					database.upsertYelpBusiness(id, { twitter : username }, function(err) {
						if (err) { 
							proc.bail('Failed to upsert biz ' + id, err); 
						}
					});
				}
				else {
					console.log(id + ' ---> NO_TWITTER_FOUND');
				}
			});

		}
		else {
			console.log(id + ' ---> NO_URL_FOUND');
		}

	});

});
