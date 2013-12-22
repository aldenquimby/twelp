var winston = require('winston');

exports.getFileLogger = function(name) {
	var logFile = '../logs/' + name + '-' + new Date().toJSON().replace(/:|-/g, '').replace('.', '') + '.json';
	var logger = new (winston.Logger)({
	    transports: [new (winston.transports.File)({ 
	    	filename: logFile
	    })]
	});
	return logger;
};
