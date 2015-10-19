var Readable = require('readable-stream').Readable
var extend = require('xtend')

module.exports = wrapPromise

function wrapPromise (promise, opts) {
  return new Readable(extend(opts, {read: readPromise}))

  function readPromise () {
    var self = this

    promise.then(pushResult, emitError)

    function pushResult (result) {
      self.push(result)
      self.push(null)
    }

    function emitError (err) {
      self.emit('error', err)
    }
  }
}
