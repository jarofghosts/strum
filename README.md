# strum

[![Build Status](http://img.shields.io/travis/jarofghosts/strum.svg?style=flat-square)](https://travis-ci.org/jarofghosts/strum)
[![npm install](http://img.shields.io/npm/dm/strum.svg?style=flat-square)](https://www.npmjs.org/package/strum)
[![npm version](https://img.shields.io/npm/v/strum.svg?style=flat-square)](https://www.npmjs.org/package/strum)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/feross/standard)
[![License](https://img.shields.io/npm/l/strum.svg?style=flat-square)](https://github.com/jarofghosts/strum/blob/master/LICENSE)
[![experimental](http://badges.github.io/stability-badges/dist/experimental.svg)](http://github.com/badges/stability-badges)

Make a stream out of almost anything

## Example

```javascript
var strum = require('strum')

strum([1, 2, 3]).pipe(process.stdout)
strum(new Set([4, 5, 6])).pipe(strum(times2)).pipe(process.stdout)

function times2 (x) {
  return x * 2
}
```

Kinda handy, but where things get really neat:

```javascript
var strum = require('strum')
var fetch = require('isomorphic-fetch')

strum(['dogs', 'cats', 'bears', 'gorillas'])
  .pipe(strum(makeRequest))
  .pipe(process.stdout)

function makeRequest (query) {
  return fetch('/some/api/?query=' + query)
    .then(function (response) {
      return response.text()
    })
}
```

It understands promises! any data source that returns a promise will be
handled smartly, such that: if it resolves, the resolved value is emitted
(rather than the promise itself), and if it is rejected, an error event is
emitted with the rejected value.

Here, have another contrived (but more ES6y!) example:

```javascript
const strum = require('strum')

strum(foreverRandom())
  .pipe(strum(headsOrTails))
  .pipe(process.stdout)

function headsOrTails (num) {
  return (num < 0.5 ? 'heads' : 'tails') + '\n'
}

function * foreverRandom () {
  while (true) {
    yield new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(Math.random())
      }, 1000)
    })
  }
}
```

## API

`strum(source, _streamOptions) -> stream`

* `source` can be any of:
  - A stream: yields the _exact same stream_.
  - An array: yields a readable stream, emitting once for each item.
  - An iterable: yields a readable stream, emitting once for every `.next()`.
  - A promise: yields a readable stream that emits once the promise is realized.
  - A function: yields a transform stream, which is called with the value of
    each write, and will emit with each returned value.

* `_streamOptions` is an optional object that will be passed to the stream
  constructor.

## Notes

* The returned value is by default a standard node stream in `objectMode`. This
  can be overridden by passing `{objectMode: false}` as your options object.
* Contributions welcome!

## License

MIT
