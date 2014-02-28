// **************************
// ****** DEPENDENCIES ******
// **************************

var lazy = require('lazy');
var fs   = require('fs');
var proc = require('../util/processUtil');

// **************************
// ******** PROGRAM ********
// **************************

var fromFile = './private/20131205_businesses.json';
var toFile = './private/yelp_business_names.json';

new lazy(fs.createReadStream(fromFile))
	.lines
	.map(function(line) {
		var biz = JSON.parse(line.toString());
		biz.reviews = [];
		console.log(biz);
		proc.done();
		return biz.name;
	})
	.join(function(bizNames) {
		fs.writeFile(toFile, JSON.stringify(bizNames), function(err) {
			if (err) {
				proc.bail(err);
			}
		});
	});
