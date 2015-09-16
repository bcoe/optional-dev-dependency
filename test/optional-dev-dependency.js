'use strict'

/* global describe, it, beforeEach */

var fs = require('fs')
var optionalDevDependency = require('../')
var rimraf = require('rimraf')

require('chai').should()

describe('optional-dev-dependency', function () {
  beforeEach(function () {
    rimraf.sync('./node_modules/camelcase')
    rimraf.sync('./node_modules/decamelize')
  })

  it('installs a module successfully', function (done) {
    optionalDevDependency(['camelcase'], {stdio: null}, function () {
      fs.existsSync('./node_modules/camelcase').should.equal(true)
      return done()
    })
  })

  it('installs more than one module successfully', function (done) {
    optionalDevDependency(['camelcase', 'decamelize'], {stdio: null}, function () {
      fs.existsSync('./node_modules/camelcase').should.equal(true)
      fs.existsSync('./node_modules/decamelize').should.equal(true)
      return done()
    })
  })

  it('handles an error from npm', function (done) {
    optionalDevDependency(['missing-aaabbbcccddd'], {stdio: null}, function () {
      return done()
    })
  })

  it('handles some errors combined with some successes', function (done) {
    optionalDevDependency(['camelcase', 'missing-aaabbbcccddd'], {stdio: null}, function () {
      fs.existsSync('./node_modules/camelcase').should.equal(true)
      return done()
    })
  })

  it('does not install a dependency if it already exists', function (done) {
    var delta = 25
    optionalDevDependency(['camelcase'], {stdio: null}, function () {
      var start = (new Date()).getTime()
      optionalDevDependency(['camelcase'], {stdio: null}, function () {
        var stop = (new Date()).getTime()
        ;(stop - start).should.be.lt(delta)
        return done()
      })
    })
  })
})
