
var keys = require('../keys');
var tsession = require("temboo/core/temboosession");
var temboo = new tsession.TembooSession(keys.TEMBOO_ACCOUNT_NAME, keys.TEMBOO_APP_NAME, keys.TEMBOO_APP_KEY);

exports.getSession = function() {
	return temboo;
};