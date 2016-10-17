'use strict'

var assign = require('lodash.assign')
var async = require('async')
var fs = require('fs')
var Dependency = require('./dependency')

// packages is either array of strings (package names), or an object whose keys
// are the package names and values are either the version specifier or an array
// whose first element is the version specifier and whose subsequent elements
// are tag names.

// examples:
// ['foo', 'bar@1']: install both foo and bar@1, regardless of _options.tags
// {foo: "1"}: install foo@1 , regardless of _options.tags
// {foo: ["1"]}: install foo@1 , regardless of _options.tags
// {foo: ["1", "a", "b"]}: install foo@1, only if a or b is in _options.tags

module.exports = function (packages, _options, cb) {
  // normalize packages to array of ['pkg', '@version', ['tag']]
  if (Array.isArray(packages)) {
    packages = packages.map(p => new Dependency(p))
  } else {
    packages = Object.keys(packages).map(key => new Dependency(key, packages[key]))
  }

  if (typeof _options === 'function') {
    cb = _options
    _options = {}
  }

  cb = cb || function () {}

  // TODO: replace with Object.assign when we have better tests, to remove a
  // dependency
  var options = assign({
    stdio: 'inherit',
    tags: ['*'],
    verbose: false
  }, _options)

  // don't bother to install packages that are already installed or aren't
  // wanted by tag
  packages = packages.filter(function (dep) {
    if (!dep.isInTags(options.tags)) {
      if (options.verbose) {
        console.error(dep.name + ': skipping (no matching tag)')
      }
      return false
    }
    if (dep.isInstalled()) {
      if (options.verbose) {
        console.error(dep.name + ': skipping (already installed)')
      }
      return false
    }
    return true
  })

  // ideally, you could npm install once with all of the package names, so
  // that npm could deal with shared dependencies.  Unfortunately, that would
  // make partial success look like an error.
  async.eachLimit(packages, 1, function (dep, next) {
    dep.install(options, next)
  }, cb)
}

// Save all of the dependencies from the list into package.json
// make this a property of the exported function in to retain backwards
// compatibility.
module.exports.saveAll = function (list, options, cb) {
  if (typeof options === 'function') {
    cb = options
    options = {}
  }
  const filename = Dependency.findNodeModules('package.json')
  fs.readFile(filename, (er, buf) => {
    if (er) { return cb(er) }
    const pkg = JSON.parse(buf) || {}
    pkg.optionalDevDependencies = pkg.optionalDevDependencies || {}
    async.eachSeries(list, function (arg, next) {
      const parts = arg.split('@')
      const name = parts[0]
      const newVer = parts[1]
      const prev = pkg.optionalDevDependencies[name]
      const dep = new Dependency(name, prev)
      dep.addTags(options.tags)
      pkg.optionalDevDependencies[name] = dep
      if (newVer) {
        dep.version = newVer
      }
      if (dep.version !== '*') {
        return next()
      }
      dep.getVersion(options, next)
    }, function () {
      fs.writeFile(filename, JSON.stringify(pkg, null, 2), cb)
    })
  })
}
