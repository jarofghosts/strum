var isStream = require('is-stream')
var isIterable = require('is-iterable')
var isPromise = require('is-promise')
var isFunction = require('is-function')

var wrapFunction = require('./lib/function')
var wrapIterable = require('./lib/iterable')
var wrapPromise = require('./lib/promise')
var wrapArray = require('./lib/array')

module.exports = strum

function strum (src, _opts) {
  var opts = _opts || {}

  if (!opts.hasOwnProperty('objectMode')) {
    opts.objectMode = true
  }

  if (isStream(src)) {
    return src
  } else if (isFunction(src)) {
    return wrapFunction(src, opts)
  } else if (Array.isArray(src)) {
    return wrapArray(src, opts)
  } else if ((global || window).hasOwnProperty('Symbol') && isIterable(src)) {
    return wrapIterable(src, opts)
  } else if (isPromise(src)) {
    return wrapPromise(src, opts)
  }

  throw new Error('invalid source type')
}
