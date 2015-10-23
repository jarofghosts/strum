'use strict'

var isPromise = require('is-promise')
var Transform = require('readable-stream').Transform
var extend = require('xtend')

module.exports = wrapFunction

function wrapFunction (fn, opts) {
  return new Transform(extend(opts, {transform: transformFn}))

  function transformFn (chunk, enc, next) {
    var self = this

    try {
      var result = fn(chunk)
    } catch (err) {
      self.emit('error', err)

      return
    }

    if (isPromise(result)) {
      result.then(pushResult, emitError)
    } else {
      self.push(result)

      if (result !== null) {
        next()
      }
    }

    function pushResult (x) {
      self.push(x)

      next()
    }

    function emitError (err) {
      self.emit('error', err)
    }
  }
}
