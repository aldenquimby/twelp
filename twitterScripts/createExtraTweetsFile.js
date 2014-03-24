// **************************
// ****** DEPENDENCIES ******
// **************************

var proc = require('../util/process'); 
var fs   = require('fs');
var lazy = require('lazy');
var _    = require('lodash');

// **************************
// ******** PROGRAM ********
// **************************

var toFile = './private/extra-tweets-' + new Date().toJSON().replace(/:|-/g, '').replace('.', '') + '.json';
var from1 = './private/convo-tweets-20140323T200759157Z.json';
var from2 = './private/user-tweets-20140323T200758755Z.json';

var allTweets = [];

new lazy(fs.createReadStream(from1))
.lines
.map(function(line) {
	return JSON.parse(line.toString());
})
.join(function(tweets1) {

	_.each(tweets1, function(ts) {
		allTweets = allTweets.concat(ts);
	});

	new lazy(fs.createReadStream(from2))
		.lines
		.map(function(line) {
			return JSON.parse(line.toString());
		})
		.join(function(tweets2) {
			
			_.each(tweets2, function(ts) {
				allTweets = allTweets.concat(ts);
			});

			fs.writeFile(toFile, JSON.stringify(allTweets), function(err) {
				if (err) { proc.bail('Failed to save file', err); }
				proc.done('Done!');
			});
		});
});

