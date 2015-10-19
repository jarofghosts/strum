var isPromise = require('is-promise')
var Readable = require('readable-stream').Readable
var Symbol = require('es6-symbol')
var extend = require('xtend')

module.exports = wrapIterable

function wrapIterable (iterable, opts) {
  var iterator = iterable[Symbol.iterator]()

  return new Readable(extend(opts, {read: readIterable}))

  function readIterable (_size) {
    var nextItem = iterator.next()
    var self = this

    if (nextItem.done === true) {
      this.push(null)

      return
    }

    if (isPromise(nextItem.value)) {
      nextItem.value.then(pushResult, emitError)
    } else {
      self.push(nextItem.value)
    }

    function pushResult (x) {
      self.push(x)
    }

    function emitError (err) {
      self.emit('error', err)
    }
  }
}
