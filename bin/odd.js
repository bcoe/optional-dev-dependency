#!/usr/bin/env node

'use strict'

var yargs = require('yargs')
  .usage('$0 package [options]')
  .option('s', {
    alias: 'silent',
    boolean: true,
    default: false,
    describe: 'should the `npm install` output be shown?'
  })
  .option('S', {
    alias: 'save',
    boolean: true,
    default: false,
    describe: 'try to install the specified packages, and save them to optionalDevDependencies in package.json'
  })
  .option('t', {
    alias: 'tag',
    describe: 'only try to load dependencies with this tag'
  })
  .option('V', {
    alias: 'verbose',
    boolean: true,
    default: false,
    describe: 'output NPM commands before running them'
  })
  .example('$0 lodash hiredis', "try to install 'lodash' and 'hiredis', it's okay if an install fails.")
  .example('$0 -t travis', "try to install optionalDevDependencies for the 'travis' tag from package.json, it's okay if an install fails.")
  .alias('h', 'help')
  .version()
  .alias('v', 'version')
  .help('h')
var argv = yargs.argv
var optionalDevDependency = require('../')

var opts = {
  stdio: argv.silent ? null : 'inherit',
  tags: (typeof argv.tag === 'string') ? [argv.tag] : argv.tag,
  verbose: argv.verbose
}

if (argv._.length === 0) {
  optionalDevDependency.readPackage((er, pkg) => {
    if (er) {
      console.error(er.message)
      process.exit(1)
    }
    argv._ = pkg.optionalDevDependencies
    if (!argv._ || Object.keys(argv._).length < 1) {
      yargs.showHelp()
      process.exit(64)
    } else {
      optionalDevDependency(argv._, opts)
    }
  })
} else if (argv.save) {
  optionalDevDependency.saveAll(argv._, opts, function () {
    optionalDevDependency(argv._, opts)
  })
} else {
  optionalDevDependency(argv._, opts)
}

