
exports.bail = function(msg, err) {
	if (msg) console.log(msg);
	if (err) console.log(err);
	process.exit(1);
};

exports.done = function(msg) {
	if (msg) console.log(msg);
	process.exit(0);
};
