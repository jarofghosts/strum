var isPromise = require('is-promise')
var Readable = require('readable-stream').Readable

module.exports = wrapArray

function wrapArray (srcArr) {
  var arr = srcArr.slice()

  return new Readable({objectMode: true, read: readArray})

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
