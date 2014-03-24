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

var saveData = function(filePath, data, callback) {
	fs.writeFile(filePath, JSON.stringify(data, null, 2), callback);
};

var upsertData = function(filePath, toUpsert, keySelector, callback) {
	var data = getData(filePath);
	keySelector = _.createCallback(keySelector);
	var byKey = _.indexBy(data, keySelector);
	byKey[keySelector(toUpsert)] = toUpsert;
	saveData(filePath, _.values(byKey), callback);
};

// *********************
// ****** EXPORTS ******
// *********************

exports.getData = getData;
exports.saveData = saveData;
exports.upsertData = upsertData;
