/* global describe, it, beforeEach */

var fs = require('fs')
var npmTryInstall = require('../')
var rimraf = require('rimraf')

require('chai').should()

describe('optional-dev-dependency', function () {
  beforeEach(function () {
    rimraf.sync('./node_modules/camelcase')
    rimraf.sync('./node_modules/decamelize')
  })

  it('installs a module successfully', function (done) {
    npmTryInstall(['camelcase'], {stdio: null}, function () {
      fs.existsSync('./node_modules/camelcase').should.equal(true)
      return done()
    })
  })

  it('installs more than one module successfully', function (done) {
    npmTryInstall(['camelcase', 'decamelize'], {stdio: null}, function () {
      fs.existsSync('./node_modules/camelcase').should.equal(true)
      fs.existsSync('./node_modules/decamelize').should.equal(true)
      return done()
    })
  })

  it('handles an error from npm', function (done) {
    npmTryInstall(['missing-aaabbbcccddd'], {stdio: null}, function () {
      return done()
    })
  })

  it('handles some errors combined with some successes', function (done) {
    npmTryInstall(['camelcase', 'missing-aaabbbcccddd'], {stdio: null}, function () {
      fs.existsSync('./node_modules/camelcase').should.equal(true)
      return done()
    })
  })
})
