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
var fs      = require("fs")

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

app.get('/link_results', function(req, res) {
	var file = fs.readFileSync('../private/link_results.json');
	res.json(JSON.parse(file));
});

app.post('/training', function(req, res) {
	res.json({message:'you posted to training!', data:req.body});
});

// **************************
// ****** START SERVER ******
// **************************

app.listen(process.env.PORT, function() {
  console.log('Express server listening on port ' + process.env.PORT);
});
