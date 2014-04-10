// **************************
// ****** DEPENDENCIES ******
// **************************

var cheerio = require('cheerio');
var request = require('request');

// **************************
// ******** PROGRAM ********
// **************************

var requestFailedMsg = function(msg, err, resp) {
	return msg + '. ' + (resp || {}).statusCode + ': ' + err;
};

exports.twitterHandleFromBiz = function(bizUrl, callback) {
	request(bizUrl, function(err, resp, body) {
		if (err || resp.statusCode != 200) {
			return callback(requestFailedMsg('Failed to download biz page ' + bizUrl, err, resp));
		}

		var regex = /href=["|'][^\'\"]+twitter.com\/([^\'\"]+)/g;
		var match = regex.exec(body.toLowerCase());

		if (!match) {
			return callback(null, null); // no error, no
		}

		var username = match[1];

		// "user/status/xxxx" -> "user"
		if (username.indexOf('/status/') != -1) {
			username = username.substring(0, username.indexOf('/status/'));
		}

		// "#!/@user" -> user
		username = username.replace(/\W/g, '');

		callback(null, username);
	});
};
