// **************************
// ******** PROCESS *********
// **************************



// **************************
// ****** DEPENDENCIES ******
// **************************

var lazy = require('lazy');
var fs  = require('fs');

// **************************
// ******** PROGRAM ********
// **************************

var fromFile = '../../../Downloads/DOHMH/20131205_businesses.json';
var toFile = 'yelp_business_urls.txt';

fs.writeFile(toFile, "", function(err) {
    if(err) {
        console.log(err);
    	process.exit(1);
    }
});

new lazy(fs.createReadStream(fromFile))
.lines
.forEach(function(line) {
	var biz = JSON.parse(line.toString());
	var smallBiz = {id:biz.id, url:biz.url};
	fs.appendFile(toFile, JSON.stringify(smallBiz) + '\n', function(err) {
		if (err) {
			console.log(err);
			process.exit(1);
		}
	});
});
