
exports.bail = function(msg, err) {
	console.log(msg);
	console.log(err);
	process.exit(1);
};

exports.done = function(msg) {
	console.log(msg);
	process.exit(0);
};
