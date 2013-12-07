// **************************
// ******** PROCESS *********
// **************************



// **************************
// ****** DEPENDENCIES ******
// **************************

var _ = require('underscore');
var cheerio = require('cheerio');
var lazy = require("lazy");
var fs  = require("fs");
var request  = require('request');

// **************************
// ******** PROGRAM ********
// **************************

bail = function(msg, err) {
	console.log(msg);
	console.log(err);
	process.exit(1);
};

var count = 0;
var fromFile = '../../../Downloads/yelp_business_urls.txt';

new lazy(fs.createReadStream(fromFile))
.lines
.take(200)
.forEach(function(line) {
	line = line.toString();

	console.log('YELP URL: ' + line);

	request(line, function(err, resp, body) {
		if (err || resp.statusCode != 200) {
			bail('Failed to download yelp page.', err);
		}
		$ = cheerio.load(body);

		var bizUrl = $('#bizUrl a');

		if (bizUrl.length > 0) {
			var url = 'http://' + bizUrl.text();
			console.log('BIZ URL: ' + url);

			request(url, function(err2, resp2, body2) {
				if (err2 || resp2.statusCode != 200) {
					console.log('Failed to download biz page: ' + url);
					console.log(err2 || resp2.statusCode);
					return;
				}

				body2 = body2.toLowerCase();

				var regex = /href=["|']([^\'\"]+twitter.com[^\'\"]+)/g;
				var match = regex.exec(body2);

				if (match) {
					count++;
					console.log('TWITTER COUNT: ' + count);
					console.log('TWITTER FOR ' + url + ':');
					console.log(match[1]);
				}
			});
		}
	});
});





