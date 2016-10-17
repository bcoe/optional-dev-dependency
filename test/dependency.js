'use strict'

/* global describe, it */

const Dependency = require('../dependency')
const should = require('chai').should()
const path = require('path')
const fs = require('fs')
const tempdir = require('./tempdir')

process.env['npm_config_cache-min'] = '9999999'

describe('dependency', function () {
  it('can be created', () => {
    ;(() => new Dependency()).should.throw(TypeError, /must be string/)

    let dep = new Dependency('camelcase')
    should.exist(dep)
    dep.name.should.equal('camelcase')
    dep.version.should.equal('*')
    dep.tags.should.deep.equal([])
    JSON.stringify(dep).should.equal('"*"')
    dep.nameAtVersion.should.equal('camelcase')

    dep = new Dependency('camelcase@^3.0.0')
    dep.version.should.equal('^3.0.0')
    JSON.stringify(dep).should.equal('"^3.0.0"')
    dep.nameAtVersion.should.equal('camelcase@^3.0.0')

    dep = new Dependency('camelcase', '^3.0.0')
    dep.version.should.equal('^3.0.0')
    JSON.stringify(dep).should.equal('"^3.0.0"')

    dep = new Dependency('camelcase', ['^3.0.0'])
    dep.version.should.equal('^3.0.0')
    dep.tags.should.deep.equal([])
    JSON.stringify(dep).should.equal('"^3.0.0"')

    dep = new Dependency('camelcase', ['^3.0.0', 'foo', 'bar'])
    dep.version.should.equal('^3.0.0')
    dep.tags.should.deep.equal(['foo', 'bar'])
    JSON.stringify(dep).should.equal('["^3.0.0","foo","bar"]')
  })

  it('should get version', done => {
    const dep = new Dependency('camelcase')
    dep.getVersion((er, ver) => {
      should.not.exist(er)
      ver.should.be.a('string')
      ver.should.have.length.above(0)
      ver.should.equal(dep.version)
      done()
    })
  })

  it('should add tags without duplicates', () => {
    const dep = new Dependency('camelcase')
    dep.tags.should.deep.equal([])
    dep.addTags()
    dep.tags.should.deep.equal([])
    dep.addTags([])
    dep.tags.should.deep.equal([])
    dep.addTags('foo')
    dep.tags.should.deep.equal(['foo'])
    dep.addTags(['foo', 'bar'])
    dep.tags.should.deep.equal(['foo', 'bar'])
    dep.addTags(['foo', 'bar', 'baz', 'baz'])
    dep.tags.should.deep.equal(['foo', 'bar', 'baz'])
  })

  it('can check for tags', () => {
    let dep = new Dependency('camelcase', ['^3.0.0', 'foo', 'bar'])
    dep.isInTags('foo').should.equal('foo')
    should.not.exist(dep.isInTags('baz'))
    dep.isInTags(['baz', 'foo']).should.equal('foo')
    dep = new Dependency('camelcase')
    dep.isInTags(['baz', 'foo']).should.equal('*')
  })

  it('can check for package installation', () => {
    let dep = new Dependency('async')
    should.equal(dep.isInstalled(), true)
    dep = new Dependency('missing-aaabbbcccddd')
    should.equal(dep.isInstalled(), false)
  })

  it('can convert to array', () => {
    ;(() => Dependency.toArray({})).should.throw(TypeError, /not string or array/)
    ;(() => Dependency.toArray(1)).should.throw(TypeError, /not string or array/)
    Dependency.toArray().should.deep.equal([])
    Dependency.toArray('foo').should.deep.equal(['foo'])
    Dependency.toArray(['foo']).should.deep.equal(['foo'])
  })

  it('can find node_modules', () => {
    Dependency.clear()
    const cwd = process.cwd() // come back here

    process.chdir(__dirname)
    let nm = Dependency.findNodeModules()
    nm.should.equal(path.join(__dirname, '..', 'node_modules'))
    nm = Dependency.findNodeModules('package.json')
    nm.should.equal(path.join(__dirname, '..', 'package.json'))

    Dependency.clear()
    process.chdir('/usr')
    ;(() => Dependency.findNodeModules()).should.throw(Error, /Not in a node package hierarchy/)
    should.not.exist(Dependency.__root)

    process.chdir(cwd)
  })

  // do not use => here, or timeout breaks
  it('can install', function (done) {
    this.timeout(5000)
    tempdir((dir, untemp) => {
      const dep = new Dependency('camelcase')
      dep.install((er) => {
        should.not.exist(er)
        fs.stat(path.join(dir, 'node_modules', 'camelcase'), (er, stats) => {
          should.not.exist(er)
          should.equal(stats.isDirectory(), true)
          untemp()
        })
      })
    }, done)
  })
})
