'use strict'

const spawn = require('cross-spawn')
const path = require('path')
const fs = require('fs')

class Dependency {
  // name could be 'foo', or 'foo@1' (if ver is null).
  // ver is an array of [ver, tag, ...]
  constructor (name, version) {
    if (typeof name !== 'string') {
      throw new TypeError('name must be string')
    }
    if (version == null) {
      const parts = name.split('@')
      this.name = parts[0]
      this.version = (parts.length > 1) ? parts[1] : '*'
      this.tags = []
    } else {
      this.name = name
      this.tags = Dependency.toArray(version)
      this.version = this.tags.shift()
    }
  }

  get nameAtVersion () {
    if (!this.version || (this.version === '*') || (this.version === 'latest')) {
      return this.name
    }
    return this.name + '@' + this.version
  }

  getVersion (options, cb) {
    if (typeof options === 'function') {
      cb = options
      options = { verbose: false }
    }
    const child = spawn('npm', ['info', this.name, 'version'], {
      stdio: ['ignore', 'pipe', 'inherit']
    })
    const data = []
    child.stdout.on('data', function (buf) { data.push(buf) })
    child.once('error', cb)
    child.once('close', () => {
      this.version = '^' + Buffer.concat(data).toString('utf8').replace(/\n$/, '')
      if (options.verbose) {
        console.error('npm info ' + this.name + ' version: ' + this.version)
      }
      cb(null, this.version)
    })
  }

  addTags (tags) {
    tags = Dependency.toArray(tags)
    if (tags.length > 0) {
      for (const tag of Dependency.toArray(tags)) {
        if (this.tags.indexOf(tag) === -1) {
          this.tags.push(tag)
        }
      }
    }
    return this.tags
  }

  // is there a tag in list that is in tags, or does list have '*' in it?
  isInTags (list) {
    if ((this.tags.length === 0) || (this.tags.indexOf('*') > -1)) {
      return '*'
    }
    list = Dependency.toArray(list)
    for (var i = 0; i < list.length; i++) {
      if (this.tags.indexOf(list[i]) > -1) {
        return list[i]
      }
    }
    return null
  }

  isInstalled () {
    try {
      const dir = path.join(Dependency.findNodeModules(), this.name)
      require.resolve(path.join(dir))
      return true
    } catch (e) {
      return false
    }
  }

  install (options, cb) {
    if (typeof options === 'function') {
      cb = options
      options = {}
    }
    const nav = this.nameAtVersion
    if (options.verbose) {
      console.error('npm install ' + nav)
    }
    const child = spawn('npm', ['install', nav], {stdio: options.stdio})
    child.once('error', (er) => {
      if (options.verbose) {
        console.error('Error installing', er.message)
      }
      cb()
    })
    child.once('close', (code) => {
      if (code !== 0) {
        if (options.verbose) {
          console.error('Error installing', nav, 'code', code, 'stdio', options.stdio)
        }
      }
      cb()
    })
  }

  toJSON () {
    const ver = this.version || '*'
    if (this.tags.length > 0) {
      return [ver].concat(this.tags)
    }
    return ver
  }

  static toArray (stringOrArray) {
    if (!stringOrArray) {
      return []
    }
    if (typeof stringOrArray === 'string') {
      return [stringOrArray]
    } else if (Array.isArray(stringOrArray)) {
      return stringOrArray
    }
    throw new TypeError('invalid input not string or array' + stringOrArray)
  }

  // Search up the path, starting at cwd, looking for node_modules
  // Note: require works off of the path of *this* module by default, not
  // from process.cwd().  Find the correct node_modules directory from cwd,
  // and use absolute paths to load from that directory.
  static findNodeModules (filename) {
    filename = filename || 'node_modules'
    if (Dependency.__root) {
      return path.join(Dependency.__root, filename)
    }
    let parts = process.cwd().split(path.sep)
    while (parts.length > 1) {
      Dependency.__root = path.sep + path.join.apply(path, parts)
      if (fs.existsSync(path.join(Dependency.__root, 'package.json'))) {
        return path.join(Dependency.__root, filename)
      }
      parts.pop()
    }
    Dependency.clear()
    throw new Error('Not in a node package hierarchy')
  }

  // Clear the cache of the project root
  static clear () {
    delete Dependency.__root
  }
}
module.exports = Dependency
