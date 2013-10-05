
exports.logErrors = function(err, req, res, next) {
  console.log('inside logErrors');
  console.error(err.stack);
  next(err);
}

exports.clientErrorHandler = function(err, req, res, next) {
  console.log('inside clientErrorHandler');
  if (req.xhr) {
    res.send(500, { error: 'Something blew up!' });
  } else {
    next(err);
  }
}

exports.errorHandler = function(err, req, res, next) {
  console.log('inside errorHandler');
  res.status(500);
  res.render('error', { error: err });
}

exports.dbErrorHandler = function(err, msg) {
  console.log('inside dbErrorHandler');
  if (msg) {
    console.log(msg);
  }
  if (err) {
    console.error(err);
  }
}
