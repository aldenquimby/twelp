// **************************
// ****** DEPENDENCIES ******
// **************************

var _       = require('underscore');
var cheerio = require('cheerio');
var lazy    = require("lazy");
var fs      = require("fs");
var request = require('request');
var ty      = require('../analysis/linkTwitterYelp');

// **************************
// ******** PROGRAM ********
// **************************

var count = 0;
var fromFile = './private/yelp_business_urls.txt';

new lazy(fs.createReadStream(fromFile))
.lines
.take(100)
.map(function (line) {
	return line.toString();
})
.forEach(function(line) {

	ty.twitterHandleFromYelp(line, function(err, bizUrl, username) {
		if (err) { 
			console.log(err);
		}
		else if (username) {
			console.log(count++ + ' ' + bizUrl + ' ==> ' + username);
		}
	});

});
