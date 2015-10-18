# strum

[![Build Status](http://img.shields.io/travis/jarofghosts/strum.svg?style=flat-square)](https://travis-ci.org/jarofghosts/strum)
[![npm install](http://img.shields.io/npm/dm/strum.svg?style=flat-square)](https://www.npmjs.org/package/strum)
[![npm version](https://img.shields.io/npm/v/strum.svg?style=flat-square)](https://www.npmjs.org/package/strum)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/feross/standard)
[![License](https://img.shields.io/npm/l/strum.svg?style=flat-square)](https://github.com/jarofghosts/strum/blob/master/LICENSE)
[![experimental](http://badges.github.io/stability-badges/dist/experimental.svg)](http://github.com/badges/stability-badges)

make streams out of things

## example

```javascript
var strum = require('strum')

strum([1, 2, 3]).pipe(process.stdout) //
strum(new Set([4, 5, 6])).pipe(strum(times2)).pipe(process.stdout)

function times2 (x) {
  return x * 2
}
```

kinda handy, but where things get really neat:

```javascript
strum(['dogs', 'cats', 'bears', 'gorillas'])
  .pipe(strum(makeRequest))
  .pipe(process.stdout)

function makeRequest (query) {
  return fetch('http://google.com/?q=' + query)
}
```

it understands promises! any data source that returns a promise will be
handled smartly, such that if: it resolves the resolved value is emitted
(rather than the promise itself), and if it is rejected, an error event is
emitted with the rejected value.

## api

`strum(source, _options) -> stream`

* source can be any of:
  - A stream: will be augmented to provide metadata (more on that later)
  - An array: yields a readable stream, emitting once for each item
  - An iterable: yields a readable stream, emitting once for every `.next()`
  - A promise: yields a readable stream that emits once the promise is realized.
  - A function: yields a transform stream, which is called with the value of
    each write, and will emit with each returned value.

* _options is an optional object that can be used to attach metadata to your
  stream; metadata like:
  - `name`: An arbitrary name to make debugging easier
  - `description`: An arbitrary description of what the stream does

The returned stream will be augmented such that all streams that it is piped to
will be available under `stream._downstreams` and all streams that pipe to it
are available under `stream._upstreams`. This is in addition to the `._name`,
and `._description` properties that will be provided.

## notes

this is extremely experimental and probably not even a good idea! i wouldn't
use this for anything important, but feel free to open issues or otherwise
contribute!

## license

MIT
