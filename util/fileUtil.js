
var fs  = require('fs');

exports.lineCount = function(file, callback) {
	var i;
	var count = 0;
	fs.createReadStream(file)
		.on('data', function(chunk) {
			for (i=0; i < chunk.length; ++i)
		  		if (chunk[i] == 10) count++;
		})
		.on('end', function() {
			callback(count);
		});
};
