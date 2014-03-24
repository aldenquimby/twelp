// **************************
// ******** PROCESS *********
// **************************

process.env.NODE_ENV = process.env.NODE_ENV || 'development';
process.env.PORT = process.env.PORT || 3000;

// **************************
// ****** DEPENDENCIES ******
// **************************

var express   = require('express');
var app       = express();
var path      = require('path');
var fs        = require('fs');
var _         = require('lodash');
var tweetSets = require('../link/tweetSets');

// **************************
// ******* MIDDLEWARE *******
// **************************

app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(require('less-middleware')(path.join(__dirname, '/public')));
app.use(express.static(path.join(__dirname, '/public')));

app.configure('development', function(){
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
    app.use(express.errorHandler());
});

// **************************
// ******** ROUTING *********
// **************************

var linkResultsPath = function(num) {
	return '../data/link_results_' + num + '.json';
};

var getLinkResults = function(num) {
	var file = fs.readFileSync(linkResultsPath(num));
	return JSON.parse(file);
};

var saveLinkResults = function(num, data, callback) {
	fs.writeFile(linkResultsPath(num), JSON.stringify(data, null, 2), callback);
};

app.get('/link_results', function(req, res) {
	var data = getLinkResults(req.param('num'));
	res.json(data);
});

app.post('/training', function(req, res) {
	var num = req.param('num');
	var data = getLinkResults(num);
	var tech = data[req.body.techniqueIndex];
	var result = tech.withScores[req.body.withScoresIndex];
	result.label = req.body.label;

	saveLinkResults(num, data, function(err) {
		if (err) {
			res.json({success:false});
		}
		else {
			res.json({success:true});
		}
	});
});

app.put('/training', function(req, res) {
	var num = req.param('num');
	var data = getLinkResults(num);
	_.each(data, function(tech) {
		_.each(tech.withScores, function(result) {
			delete result.label;
		});
	});

	saveLinkResults(num, data, function(err) {
		if (err) {
			res.json({success:false});
		}
		else {
			res.json({success:true});
		}
	});
});

app.get('/tweetSet', function(req, res) {
	var data = tweetSets.getSets();
	res.json(data);
});

app.post('/tweetSet', function(req, res) {
	tweetSets.upsertSet(req.body);
	console.log('upserted data!');
	console.log(tweetSets.getSets().length + ' left');
	res.json({success:true});
});

app.put('/tweetSet', function(req, res) {
	tweetSets.createSets();
	console.log('reset data!');
	tweetSets.scoreSets();
	console.log('scored data!');
	res.json({success:true});
});

// **************************
// ****** START SERVER ******
// **************************

app.listen(process.env.PORT, function() {
  console.log('Express server listening on port ' + process.env.PORT);
});
