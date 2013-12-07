// **************************
// ******** PROCESS *********
// **************************



// **************************
// ****** DEPENDENCIES ******
// **************************

var lazy = require("lazy");
var fs  = require("fs");

// **************************
// ******** PROGRAM ********
// **************************

var fromFile = '../../../../Downloads/20131205_businesses.json';
var toFile = '../../../../Downloads/yelp_business_urls.txt';

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
	fs.appendFile(toFile, biz.url + '\n', function(err) {
		if (err) {
			console.log(err);
			process.exit(1);
		}
	});
});

/*


<div id="bizUrl">
		    <a href="/biz_redir?url=http%3A%2F%2Fwww.burgainc.com%2F&amp;src_bizid=mTbyB8QdjRxxR-7CIN1n5g&amp;cachebuster=1386347519&amp;s=b463a49cdb26271f69f71d547b3a92420241427a9835063046580f18c412ced4" target="_blank">burgainc.com</a>
		</div>

*/
