// **************************
// ******** PROCESS *********
// **************************

var query = process.argv.length > 2 ? process.argv[2] : 'food poisoning';
var city = process.argv.length > 3 ? process.argv[3] : 'NYC';

// **************************
// ****** DEPENDENCIES ******
// **************************

var _       = require('lodash');
var Factual = require('factual-api');
var keys    = require('../private/keys');
var factual = new Factual(keys.FACTUAL_KEY, keys.FACTUAL_SECRET);

// **************************
// ******** PROGRAM ********
// **************************

getAllCrosswalkData = function(factual_id) {
	if (!factual_id || factual_id == '') {
		return console.log('no factual id!');
	}
	var url = '/t/crosswalk?filters={"factual_id":"' + factual_id + '"}';
	factual.get(url, function (error, res) {
	  console.log('***********************');
	  _.each(res.data, function(obj) {
	  	console.log(obj.url);
	  });
	  console.log('***********************');
	});
};

factual.get('/t/crosswalk?filters={"url":"http://www.yelp.com/biz/per-se-new-york"}', function (error, res) {
	if (res.data.length == 0) {
		console.log('no results!');
	}
	else if (res.data.length > 1) {
		console.log('too many results!');
	}
	else {
		getAllCrosswalkData(res.data[0].factual_id);
	}
});

factual.get('/t/crosswalk?q=the container store&filters={"namespace":"yelp"}', function (error, res) {
	if (res.data.length == 0) {
		console.log('no results!');
	}
	else if (res.data.length > 1) {
		console.log('too many results!');
	}
	else {
		getAllCrosswalkData(res.data[0].factual_id);
	}
});
