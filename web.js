// **************************
// ******** PROCESS *********
// **************************

process.env.NODE_ENV = process.env.NODE_ENV || 'development';
var port = process.env.PORT || 5115;
var dbUrl = process.env.DATABASE_URL;

// **************************
// ****** DEPENDENCIES ******
// **************************

var express = require('express');
var index = require('./routes/index');
var app = express();
var database = require('./api/database');

// **************************
// ******** DATABASE ********
// **************************

dbUrl = dbUrl || require('./keys').DATABASE_URL;
database.connect(dbUrl, function() {
	console.log('opened mongo connection');
}, function(err) {
	console.log(err);
	process.exit(1);
});

// **************************
// ******* MIDDLEWARE *******
// **************************

app.set('views', __dirname + '/views');
app.set('view engine', 'hjs');
app.use(express.favicon(__dirname + "/public/images/favicon.ico")); 
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here12345431'));
app.use(express.session({secret: 'your secret here12345431'}));
app.use(app.router);
app.use(require('less-middleware')({ src: __dirname + '/public' }));
app.use(express.static(__dirname + '/public'));

app.configure('development', function(){
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
    app.use(express.errorHandler());
});

// **************************
// ******** ROUTING *********
// **************************

app.get('/', index.index);
app.get('/startTwitterStream', index.startTwitterStream);
app.get('/stopTwitterStream', index.stopTwitterStream);

// **************************
// ****** START SERVER ******
// **************************

app.listen(port, function() {
  console.log('Express server listening on port ' + port);
});
