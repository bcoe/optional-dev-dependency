#!/usr/bin/env node

'use strict'

var yargs = require('yargs')
  .usage('$0 package [options]')
  .option('s', {
    alias: 'silent',
    default: false,
    describe: 'should the `npm install` output be shown?'
  })
  .example('$0 lodash hiredis', "try to install 'lodash' and 'hiredis', it's okay if an install fails.")
  .alias('h', 'help')
  .version(require('../package').version, 'v')
  .alias('v', 'version')
  .help('h')
var argv = yargs.argv
var optionalDevDependency = require('../')

if (argv._.length === 0) {
  yargs.showHelp()
} else {
  optionalDevDependency(argv._, {
    stdio: argv.silent ? null : 'inherit',
    concurrency: argv.concurrency
  })
}
