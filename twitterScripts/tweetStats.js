// **************************
// ****** DEPENDENCIES ******
// **************************

var _        = require('underscore');
var database = require('../api/database');
var proc     = require('../util/processUtil');

// **************************
// ********** MAIN **********
// **************************

function getWeek(d) {
    // Copy date so don't modify original
    d = new Date(+d);
    d.setHours(0,0,0);
    // Set to nearest Thursday: current date + 4 - current day number
    // Make Sunday's day number 7
    d.setDate(d.getDate() + 4 - (d.getDay()||7));
    // Get first day of year
    var yearStart = new Date(d.getFullYear(),0,1);
    // Calculate full weeks to nearest Thursday
    var weekNo = Math.ceil(( ( (d - yearStart) / 86400000) + 1)/7)
    // Return array of year and week number
    return d.getFullYear() + '' + weekNo;
}

database.runWithConn(function() {

	database.findTweets({}, function(err, tweets) {
		if (err) {
			proc.bail('Failed to get tweets.', err);
		}

		// TWEETS PER WEEK

		var tweetsPerWeek = _.countBy(tweets, function(tweet) {
			return getWeek(tweet.created_at);
		});

		console.log('TWEETS PER WEEK');
		console.log(tweetsPerWeek);

		// CONVERSATION TWEETS

		var convos = _.flatten(_.pluck(tweets, 'conversation'));
		var uniqueTweets = _.uniq(_.pluck(convos, 'id'));

		console.log('CONVERSATION TWEETS');
		console.log(uniqueTweets.length);

		proc.done();
	});

});
