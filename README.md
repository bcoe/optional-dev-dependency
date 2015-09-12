# optional-dev-dependency

[![Build Status][travis-image]][travis-url]
[![Coverage Status][coveralls-image]][coveralls-url]
[![NPM version][npm-image]][npm-url]
[![js-standard-style][standard-image]][standard-url]

For when you want to try to install a module, but want to keep on truckin'
if you are unable to. I found this useful for simulating optional-dev-dependencies.

```shell
optional-dev-dependency lodash fffffffgggggg
```

## Example

Here's an example from `node_redis`:

```json
{
  "name": "redis",
  "scripts": {
    "coverage": "nyc report --reporter=text-lcov | coveralls",
    "test": "nyc ./node_modules/.bin/_mocha ./test/*.js ./test/commands/*.js ./test/parser/*.js --timeout=8000",
    "pretest": "optional-dev-dependency hiredis"
  }
}
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
