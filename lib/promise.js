var Readable = require('readable-stream').Readable

module.exports = wrapPromise

function wrapPromise (promise) {
  return new Readable({read: readPromise, objectMode: true})

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
