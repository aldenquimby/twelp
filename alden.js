// **************************
// ****** DEPENDENCIES ******
// **************************

var tm = require('./analysis/twelpMap'); 

// **************************
// ******** PROGRAM ********
// **************************

var bail = function(msg, err) {
	console.log(msg);
	console.log(err);
	process.exit(1);
};

var done = function(msg) {
	console.log(msg || '');
	process.exit(0);
};

tm.analyzeTwelpMap(function(err, res) {
	if (err) {
		bail('', err);
	}

	console.log('TOTAL BIZS   : ' + res.bizs);
	console.log('WITH SITES   : ' + res.withSite);
	console.log('WITH TWITTER : ' + res.withTwitter);
	console.log('TWITTER DUPS : ' + res.dupUsernames);
	console.log('GOOD TWITTER : ' + res.goodUsernames);

	done();
});
