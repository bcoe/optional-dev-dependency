'use strict'

var assign = require('lodash.assign')
var async = require('async')
var spawn = require('win-spawn')

module.exports = function (packages, _options, cb) {
  if (typeof _options === 'function') {
    cb = _options
    _options = {}
  }

  cb = cb || function () {}

  var options = assign({
    stdio: 'inherit'
  }, _options)

  async.eachLimit(packages, 1, function (pkg, next) {
    var child = spawn('npm', ['install', pkg], {stdio: options.stdio})
    child.on('close', function () {
      return next()
    })
  }, function (err) {
    return cb(err)
  })
}
