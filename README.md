# optional-dev-dependency

[![Build Status][travis-image]][travis-url]
[![Coverage Status][coveralls-image]][coveralls-url]
[![NPM version][npm-image]][npm-url]
[![js-standard-style][standard-image]][standard-url]

For when you want to try to install a module, but want to keep on truckin'
if you are unable to. I found this useful for simulating optional-dev-dependencies.

```shell
optional-dev-dependency lodash redis@2.2.3 fffffffgggggg
```

All different [npm install styles](https://docs.npmjs.com/cli/install) are supported besides the git remote url

## Command Line

```
optional-dev-dependency package [options]

Options:
  -s, --silent   should the `npm install` output be shown?
                                                      [boolean] [default: false]
  -S, --save     try to install the specified packages, and save them to
                 optionalDevDependencies in package.json
                                                      [boolean] [default: false]
  -t, --tag      only try to load dependencies with this tag
  -V, --verbose  output NPM commands before running them
                                                      [boolean] [default: false]
  -h, --help     Show help                                             [boolean]
  -v, --version  Show version number                                   [boolean]

Examples:
  ../bin/odd.js lodash hiredis  try to install 'lodash' and 'hiredis', it's okay
                                if an install fails.
  ../bin/odd.js -t travis       try to install optionalDevDependencies for the
                                'travis' tag from package.json, it's okay if an
                                install fails.
```

## Examples

Here's an example from `node_redis`:

```json
{
  "name": "redis",
  "scripts": {
    "pretest": "optional-dev-dependency hiredis"
  }
}
```

You can also save optionalDevDependencies in your `package.json` file for ease
of installation later.  For example, let's say you want most developers who
download your package and play with it to run basic tests, but when you run your
code on your continuous integration server, you need a few extra dependencies.
You can use a `package.json` file like this:

```json
{
  "name": "sample",
  "scripts": {
    "test": "mocha",
    "precoverage": "optional-dev-dependency",
    "coverage": "nyc npm test",
    "preci": "optional-dev-dependency -t ci",
    "ci": "nyc report --reporter=text-lcov | coveralls"
  },
  "optionalDevDependencies": {
    "nyc": "^8.3.1",
    "coveralls": [
      "^2.11.14",
      "ci"
    ]
  }
}
```

When you do `npm run coverage`, the `precoverage` script will ensure that all
optionalDevDependencies without a tag are installed (in this case, `nyc`).

When you do `npm run ci` on your CI server, the `preci` script will ensure that
all optionalDevDependencies with the `ci` tag are installed (in this case,
`coveralls`).

You can load optionalDevDependencies into your `package.json` with the
--save/-S flag.  This will install the latest lodash, save that version
in your `package.json`, and will only install it later if the `foo` or `bar`
tag is specified:

```shell
optional-dev-dependency --save lodash -t foo -t bar
```

## License

ISC

[travis-url]: https://travis-ci.org/bcoe/optional-dev-dependency
[travis-image]: https://img.shields.io/travis/bcoe/optional-dev-dependency.svg
[coveralls-url]: https://coveralls.io/github/bcoe/optional-dev-dependency
[coveralls-image]: https://img.shields.io/coveralls/bcoe/optional-dev-dependency.svg
[npm-url]: https://npmjs.org/package/optional-dev-dependency
[npm-image]: https://img.shields.io/npm/v/optional-dev-dependency.svg
[standard-image]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg
[standard-url]: https://github.com/feross/standard
