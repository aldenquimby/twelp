
var Yelp = require("temboo/Library/Yelp");

exports.searchByCity(temboo) {

	var searchByCityChoreo = new Yelp.SearchByCity(session);

	// Instantiate and populate the input set for the choreo
	var searchByCityInputs = searchByCityChoreo.newInputSet();

	// Set credentials
	searchByCityInputs.setCredential('Yelp');

	// Set inputs
	searchByCityInputs.set_Count("100");
	searchByCityInputs.set_BusinessType("restaurants");
	searchByCityInputs.set_City("New York");

	// Run the choreo, specifying success and error callback handlers
	searchByCityChoreo.execute(searchByCityInputs,
	    function(results) {
	    	console.log(results.get_Response());
	    },
	    function(error) {
	    	console.log(error.type); 
	    	console.log(error.message);
	    }
    );
}
