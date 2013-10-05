// **************************
// ******** PROCESS *********
// **************************

process.env.NODE_ENV = process.env.NODE_ENV || 'development';
process.env.PORT = process.env.PORT || 5115;

/*
process.env.DATABASE_URL = process.env.DATABASE_URL || require('./keys').DATABASE_URL;

var mongoose = require('mongoose');
var db = mongoose.connection;

// connect to mongo
db.on('error', function(err) {
  console.error(err);
});
db.once('open', function callback() {
  console.log('opened mongo connection');
  blogs.registerSchema();
});

mongoose.connect(process.env.DATABASE_URL);
*/

// **************************
// ****** DEPENDENCIES ******
// **************************

var keys = require('./keys');
var express = require('express');
var index = require('./routes/index');
var twelp = require('./routes/twelp');
var app = express();
var tsession = require("temboo/core/temboosession");
var session = new tsession.TembooSession(keys.TEMBOO_ACCOUNT_NAME, keys.TEMBOO_APP_NAME, keys.TEMBOO_APP_KEY);

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
app.get('/twelp', twelp.findAll);
app.post('/twelp', twelp.create);
app.get('/twelp/:id', twelp.findById);
app.put('/twelp/:id', twelp.update);
app.del('/twelp/:id', twelp.remove);

// **************************
// ****** START SERVER ******
// **************************

app.listen(process.env.PORT, function() {
  console.log('Express server listening on port ' + process.env.PORT);
});
