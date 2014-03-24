// **************************
// ****** DEPENDENCIES ******
// **************************

var fs      = require('fs');
var _       = require('lodash');

// **************************
// ******** FUNCTIONS *******
// **************************

var getData = function(filePath) {
	var file = fs.readFileSync(filePath);
	return JSON.parse(file);
};

var saveData = function(filePath, data) {
	fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

var upsertData = function(filePath, toUpsert, keySelector) {
	var data = getData(filePath);
	keySelector = _.createCallback(keySelector);
	var byKey = _.indexBy(data, keySelector);
	var key = keySelector(toUpsert);
	if (!byKey[key]) {
		console.log('inserting...');
	}
	else {
		console.log('updating...');
	}
	byKey[key] = toUpsert;
	saveData(filePath, _.values(byKey));
};

var getTweetsFromFiles = function(files) {
	var tweetsById = {};
	_.each(files, function(file) {
		var tweets = getData(file);
		_.each(tweets, function(tweet) {
			tweetsById[tweet.id] = tweet;
		});
	});
	return _.values(tweetsById);
};

// *********************
// ****** EXPORTS ******
// *********************

exports.getData = getData;
exports.saveData = saveData;
exports.upsertData = upsertData;
exports.getTweetsFromFiles = getTweetsFromFiles;
