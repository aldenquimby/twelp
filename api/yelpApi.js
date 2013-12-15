
var keys = require('../private/keys');
var yelp = require("yelp").createClient({
  consumer_key: keys.YELP_CONSUMER_KEY, 
  consumer_secret: keys.YELP_CONSUMER_SECRET,
  token: keys.YELP_ACCESS_TOKEN,
  token_secret: keys.YELP_ACCESS_SECRET
});

exports.searchYelp = function(callback) {
	// See http://www.yelp.com/developers/documentation/v2/search_api
	yelp.search({term: "food", location: "Montreal"}, function(error, data) {
	  console.log(error);
	  console.log(data);
	});

	// See http://www.yelp.com/developers/documentation/v2/business
	yelp.business("yelp-san-francisco", function(error, data) {
	  console.log(error);
	  console.log(data);
	});
};
