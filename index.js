var assign = require('lodash.assign')
var async = require('async')
var spawn = require('win-spawn')

module.exports = function (packages, _options, cb) {
  if (typeof _options === 'function') {
    cb = _options
    _options = {}
  }

  var options = assign({
    stdio: 'inherit',
    concurrency: 1
  }, _options)

  async.eachLimit(packages, options.concurrency, function (pkg, next) {
    var child = spawn('npm', ['install', pkg], {stdio: options.stdio})
    child.on('close', function () {
      return next()
    })
  }, function (err) {
    return cb(err)
  })
}
