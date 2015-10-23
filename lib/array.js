'use strict'

var isPromise = require('is-promise')
var Readable = require('readable-stream').Readable
var extend = require('xtend')

module.exports = wrapArray

function wrapArray (srcArr, opts) {
  var arr = srcArr.slice()

  return new Readable(extend(opts, {read: readArray}))

  function readArray () {
    var self = this
    var result

    if (!arr.length) {
      self.push(null)

      return
    }

    result = arr.shift()

    if (isPromise(result)) {
      result.then(pushResult, emitError)
    } else {
      self.push(result)
    }

    function pushResult (x) {
      self.push(x)
    }

    function emitError (err) {
      self.emit('error', err)
    }
  }
}
