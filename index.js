var isFunction = require('util').isFunction

var isStream = require('is-stream')
var isIterable = require('is-iterable')
var isPromise = require('is-promise')

var wrapFunction = require('./lib/function')
var wrapIterable = require('./lib/iterable')
var wrapPromise = require('./lib/promise')
var wrapArray = require('./lib/array')

module.exports = strum

function strum (src, _opts) {
  var opts = _opts || {}

  opts.source = opts.source || src

  if (isStream(src)) {
    return wrapStream(src, opts)
  } else if (isFunction(src)) {
    return strum(wrapFunction(src), opts)
  } else if (Array.isArray(src)) {
    return strum(wrapArray(src), opts)
  } else if ((global || window).hasOwnProperty('Symbol') && isIterable(src)) {
    return strum(wrapIterable(src), opts)
  } else if (isPromise(src)) {
    return strum(wrapPromise(src), opts)
  }

  throw new Error('invalid source type')
}

function wrapStream (stream, opts) {
  Object.defineProperties(
    stream,
    {
      _upstreams: {value: []},
      _downstreams: {value: []},
      _description: {value: opts.description || ''},
      _name: {value: opts.name || ''},
      _source: {value: opts.source}
    }
  )

  if (stream.pipe) {
    patchPipe(stream)
  }

  stream.on('pipe', addReader)
  stream.on('unpipe', removeReader)

  return stream

  function addReader (src) {
    stream._upstreams.push(src)
  }

  function removeReader (src) {
    stream._upstreams.splice(stream._upstreams.indexOf(src), 1)
  }
}

function patchPipe (stream) {
  var originalPipe = stream.pipe
  var originalUnpipe = stream.unpipe

  stream.pipe = function strum$patchedPipe (dst) {
    stream._downstreams.push(dst)

    return originalPipe.apply(stream, arguments)
  }

  if (originalUnpipe && isFunction(originalUnpipe)) {
    stream.unpipe = function strum$patchedUnpipe (dst) {
      stream._downstreams.splice(stream._downstreams.indexOf(dst), 1)

      return originalUnpipe.apply(stream, arguments)
    }
  }
}
