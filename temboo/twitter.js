
var Twitter = require("temboo/Library/Twitter/Search");

exports.search(temboo) {

	var tweetsChoreo = new Twitter.Tweets(session);

	// Instantiate and populate the input set for the choreo
	var tweetsInputs = tweetsChoreo.newInputSet();

	// Set credentials
	tweetsInputs.setCredential('Twitter');

	// Set inputs
	tweetsInputs.set_Count("200");
	tweetsInputs.set_Query("Burgers");
	tweetsInputs.set_Language("en");
	tweetsInputs.set_ResultType("recent");
	tweetsInputs.set_Geocode("40.714457,-74.005339,5mi");

	// Run the choreo, specifying success and error callback handlers
	tweetsChoreo.execute(tweetsInputs,
	    function(results) {
	    	console.log(results.get_Limit());
	    },
	    function(error) {
	    	console.log(error.type); 
	    	console.log(error.message);
	    }
	);	
}
