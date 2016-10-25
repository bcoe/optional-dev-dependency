'use strict'

/* global describe, it, beforeEach */

var fs = require('fs')
var optionalDevDependency = require('../')
var path = require('path')
var rimraf = require('rimraf')
var tempdir = require('./tempdir')

var should = require('chai').should()

process.env['npm_config_cache-min'] = '9999999'

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

  it('installs a module with a specific version successfully if found', function (done) {
    optionalDevDependency(['camelcase@1.1.0'], {stdio: null}, function () {
      fs.existsSync('./node_modules/camelcase').should.equal(true)
      return done()
    })
  })

  it('handles version not found error from npm', function (done) {
    optionalDevDependency(['camelcase@1.0.999'], {stdio: null}, function () {
      fs.existsSync('./node_modules/camelcase').should.equal(false)
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

  it('installs dependency from object', function (done) {
    fs.existsSync('./node_modules/camelcase').should.equal(false)
    fs.existsSync('./node_modules/decamelize').should.equal(false)
    optionalDevDependency({'camelcase': '^3.0.0'}, {stdio: null}, function () {
      fs.existsSync('./node_modules/camelcase').should.equal(true)
      done()
    })
  })

  it('installs dependency from object with a tag', function (done) {
    fs.existsSync('./node_modules/camelcase').should.equal(false)
    fs.existsSync('./node_modules/decamelize').should.equal(false)
    optionalDevDependency({
      camelcase: ['^3.0.0', 'foo'],
      decamelize: ['^1.2']
    }, {
      stdio: null,
      tags: ['foo']
    }, function () {
      fs.existsSync('./node_modules/camelcase').should.equal(true)
      fs.existsSync('./node_modules/decamelize').should.equal(true)
      done()
    })
  })

  it('skips dependencies with no matching tag', function (done) {
    fs.existsSync('./node_modules/camelcase').should.equal(false)
    fs.existsSync('./node_modules/decamelize').should.equal(false)
    optionalDevDependency({
      camelcase: ['^3.0.0', 'foo'],
      decamelize: '^1.2'
    }, {
      stdio: null,
      tags: ['bar', 'baz']
    }, function () {
      fs.existsSync('./node_modules/camelcase').should.equal(false)
      fs.existsSync('./node_modules/decamelize').should.equal(true)
      done()
    })
  })

  it('can save new dependencies', function (done) {
    tempdir(function (dir, untmp) {
      optionalDevDependency.saveAll(['camelcase'], function (er) {
        should.not.exist(er)
        var pkg = fs.readFileSync(path.join(dir, 'package.json'))
        pkg = JSON.parse(pkg)
        var ver = pkg.optionalDevDependencies.camelcase
        ver.should.be.a('string')
        ver.should.match(/^\^/)
        optionalDevDependency.saveAll(['camelcase@2'], {tags: ['foo', 'bar']}, function (er) {
          should.not.exist(er)
          var pkg = fs.readFileSync(path.join(dir, 'package.json'))
          pkg = JSON.parse(pkg)
          var ver = pkg.optionalDevDependencies.camelcase
          ver.should.be.instanceof(Array)
          untmp()
        })
      })
    }, done)
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
