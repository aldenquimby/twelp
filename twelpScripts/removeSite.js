// **************************
// ****** DEPENDENCIES ******
// **************************

var proc      = require('../util/process'); 
var _         = require('lodash');
var database  = require('../api/database'); 

// **************************
// ******** PROGRAM ********
// **************************

database.runWithConn(function() {

	database.getYelpBusinesses({}, function(err, bizs) {
		if (err) { proc.bail('Failed to get bizs', err); }

		_.each(bizs, function(biz) {
			if (biz.site) {
				database.updateYelpBusiness(biz['_id'], {'$unset': { site : 1 } }, function(err2, updated) {
					if (err2) { proc.bail('Updating biz failed.', err2); }
					console.log('Updated ' + biz.id);
				});
			}
		})

	});

});
