// **************************
// ******** PROCESS *********
// **************************



// **************************
// ****** DEPENDENCIES ******
// **************************

var fs  = require("fs");

// **************************
// ******** PROGRAM ********
// **************************

var i;
var count = 0;
var fromFile = '../../../Downloads/yelp_business_urls.txt';

fs.createReadStream(fromFile)
	.on('data', function(chunk) {
		for (i=0; i < chunk.length; ++i)
	  		if (chunk[i] == 10) count++;
	})
	.on('end', function() {
		console.log(count);
	});