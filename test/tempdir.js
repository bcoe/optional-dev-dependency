'use strict'

const rimraf = require('rimraf')
const fs = require('fs')
const path = require('path')
const Dependency = require('../dependency')

const PKG = JSON.stringify({
  name: 'sample',
  version: '1.0.0',
  description: 'Sample with optionalDevDependencies',
  license: 'ISC',
  repository: 'none'
}, null, 2)

let count = 0

// create a temporary directory, populate it with a package.json, cd to it.
// run the ready function, then return to the previous directory, clean up,
// and call cb
module.exports = function (ready, cb) {
  const cwd = process.cwd()
  const tmp = path.join(__dirname, '..', 'tmp' + (count++))

  function cleanup (er) {
    process.chdir(cwd)
    rimraf(tmp, () => cb(er))
    Dependency.clear()
  }

  // clean up in case there was a problem with a previous test
  // yes...  you wish I had used promises instead.
  rimraf(tmp, () => {
    fs.mkdir(tmp, (er) => {
      if (er) { return cleanup(er) }
      process.chdir(tmp)
      fs.writeFile('package.json', PKG, (er) => {
        if (er) { return cleanup(er) }
        try {
          Dependency.clear()
          ready(tmp, cleanup)
        } catch (er) {
          return cleanup(er)
        }
      })
    })
  })
}
