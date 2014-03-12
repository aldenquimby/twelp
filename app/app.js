// **************************
// ******** PROCESS *********
// **************************

process.env.NODE_ENV = process.env.NODE_ENV || 'development';
process.env.PORT = process.env.PORT || 3000;

// **************************
// ****** DEPENDENCIES ******
// **************************

var express = require('express');
var app     = express();
var path    = require('path');
var fs      = require('fs');
var _       = require('lodash');

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

var linkResultsPath = function(date) {
	return '../data/link_results_' + date + '.json';
};

var getLinkResults = function(date) {
	var file = fs.readFileSync(linkResultsPath(date));
	return JSON.parse(file);
};

var saveLinkResults = function(date, data, callback) {
	fs.writeFile(linkResultsPath(date), JSON.stringify(data, null, 2), callback);
};

app.get('/link_results', function(req, res) {
	var data = getLinkResults(req.param('date'));
	res.json(data);
});

app.post('/training', function(req, res) {
	var date = req.param('date');
	var data = getLinkResults(date);
	var tech = data[req.body.techniqueIndex];
	var result = tech.withScores[req.body.withScoresIndex];
	result.label = req.body.label;

	saveLinkResults(date, data, function(err) {
		if (err) {
			res.json({success:false});
		}
		else {
			res.json({success:true});
		}
	});
});

app.put('/training', function(req, res) {
	var date = req.param('date');
	var data = getLinkResults(date);
	_.each(data, function(tech) {
		_.each(tech.withScores, function(result) {
			delete result.label;
		});
	});

	saveLinkResults(date, data, function(err) {
		if (err) {
			res.json({success:false});
		}
		else {
			res.json({success:true, data:data});
		}
	});
});

// **************************
// ****** START SERVER ******
// **************************

app.listen(process.env.PORT, function() {
  console.log('Express server listening on port ' + process.env.PORT);
});
