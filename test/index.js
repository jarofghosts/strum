var isError = require('util').isError

var test = require('tape')
var Stream = require('readable-stream')
var Promise = global.Promise || require('es6-promise').Promise
var Set = require('es6-set')

var strum = require('../')

test('throws error if source is invalid', function (t) {
  t.plan(4)

  t.throws(function () {
    strum(0)
  })

  t.throws(function () {
    strum('lol')
  })

  t.throws(function () {
    strum(null)
  })

  t.throws(function () {
    strum(undefined)
  })
})

test('can make a stream from an array', function (t) {
  t.plan(5)

  var arr = [1, 2, 3]
  var count = 0

  var arrayStream = strum(arr)

  arrayStream.on('data', function (x) {
    t.equal(x, arr[count++])
  })

  arrayStream.on('end', function () {
    t.deepEqual(arr, [1, 2, 3])
    t.equal(count, 3)
  })
})

test('can pass options to stream constructor', function (t) {
  t.plan(4)

  var arr = ['lol', promisify('lol')]
  var arrayStream = strum(arr, {objectMode: false})

  arrayStream.on('data', function (buf) {
    t.true(Buffer.isBuffer(buf))
    t.equal(buf.toString(), 'lol')
  })
})

test('arrays can contain promises', function (t) {
  t.plan(5)

  var arr = [promisify(1), promisify(2), promisify(3)]
  var count = 0

  var arrayStream = strum(arr)

  arrayStream.on('data', function (x) {
    t.equal(x, ++count)
  })

  arrayStream.on('end', function () {
    t.equal(arr.length, 3)
    t.equal(count, 3)
  })
})

test('those promises can cause errors', function (t) {
  t.plan(2)

  var arr = [badPromise()]
  var arrayStream = strum(arr)

  arrayStream.on('error', function (err) {
    t.true(isError(err))
    t.equal(err.message, 'rejected promise!!')
  })

  arrayStream.read()

  function badPromise () {
    return new Promise(function (resolve, reject) {
      reject(new Error('rejected promise!!'))
    })
  }
})

test('can make a stream from a promise', function (t) {
  t.plan(2)

  var promise = makePromise()
  var promiseStream = strum(promise)

  promiseStream.on('data', function (data) {
    t.equal(data, 'lol')
  })

  promiseStream.on('end', function () {
    t.pass('ends once resolved')
  })

  function makePromise () {
    return new Promise(function (resolve, reject) {
      resolve('lol')
    })
  }
})

test('passes options to stream constructor', function (t) {
  t.plan(3)

  var promise = makePromise()
  var promiseStream = strum(promise, {objectMode: false})

  promiseStream.on('data', function (data) {
    t.true(Buffer.isBuffer(data))
    t.equal(data.toString(), 'lol')
  })

  promiseStream.on('end', function () {
    t.pass('ends once resolved')
  })

  function makePromise () {
    return new Promise(function (resolve, reject) {
      resolve('lol')
    })
  }
})

test('emits error if promise is rejected', function (t) {
  t.plan(2)

  var promise = makePromise()
  var promiseStream = strum(promise)

  promiseStream.on('data', function (data) {
    t.fail('should never emit data')
  })

  promiseStream.on('error', function (err) {
    t.true(isError(err))
    t.equal(err.message, 'promise rejected')
  })

  function makePromise () {
    return new Promise(function (resolve, reject) {
      reject(new Error('promise rejected'))
    })
  }
})

test('makes a transform stream from a function', function (t) {
  t.plan(2)

  var functionStream = strum(transformFn)

  functionStream.on('data', function (data) {
    t.equal(data, 'LOL')
  })

  functionStream.on('end', function () {
    t.pass('ends')
  })

  functionStream.end('lol')

  function transformFn (str) {
    return str.toString().toUpperCase()
  }
})

test('if function throws, error is emitted', function (t) {
  t.plan(2)

  var functionStream = strum(badFn)

  functionStream.on('error', function (err) {
    t.true(isError(err))
    t.equal(err.message, 'function threw!')
  })

  functionStream.write('whatever')

  function badFn () {
    throw new Error('function threw!')
  }
})

test('passes options to stream constructor', function (t) {
  t.plan(2)

  var functionStream = strum(transformFn, {objectMode: false})

  functionStream.on('data', function (data) {
    t.true(Buffer.isBuffer(data))
    t.equal(data.toString(), 'LOL')
  })

  functionStream.end('lol')

  function transformFn (str) {
    return str.toString().toUpperCase()
  }
})

test('function streams understand promises', function (t) {
  t.plan(2)

  var functionStream = strum(transformFn)

  functionStream.on('data', function (data) {
    t.equal(data, 'LOL')
  })

  functionStream.on('end', function () {
    t.pass('ends')
  })

  functionStream.end('lol')

  function transformFn (str) {
    return new Promise(function (resolve, reject) {
      resolve(str.toString().toUpperCase())
    })
  }
})

test('those promises can cause errors', function (t) {
  t.plan(2)

  var functionStream = strum(transformFn)

  functionStream.on('error', function (err) {
    t.true(isError(err))
    t.equal(err.message, 'rejected promise!')
  })

  functionStream.end('lol')

  function transformFn (str) {
    return new Promise(function (resolve, reject) {
      reject(new Error('rejected promise!'))
    })
  }
})

if (!global.hasOwnProperty('Symbol')) {
  test('in environments without Symbol, skips trying iterables', function (t) {
    t.plan(1)

    t.throws(function () {
      strum(new Set([1, 2, 3]))
    })
  })
} else {
  test('can make a stream from an iterable', function (t) {
    t.plan(4)

    var set = new Set([1, 2, 3])
    var setStream = strum(set)
    var count = 0

    setStream.on('data', function (data) {
      t.equal(data, ++count)
    })

    setStream.on('end', function () {
      t.equal(count, 3)
    })
  })

  test('passes arguments to stream constructor', function (t) {
    t.plan(4)

    var set = new Set(['lol', promisify('lol')])
    var setStream = strum(set, {objectMode: false})

    setStream.on('data', function (data) {
      t.true(Buffer.isBuffer(data))
      t.equal(data.toString(), 'lol')
    })
  })
}

test('a stream is ... already a stream', function (t) {
  t.plan(1)

  var stream = new Stream.Readable()

  t.equal(strum(stream), stream)
})

test('integration test 1', function (t) {
  t.plan(1)

  var result = []

  strum(['charizard', 'pikachu', promisify('chansey'), promisify('mr. mime')])
    .pipe(strum(uppercase))
    .on('data', function (data) {
      result.push(data)
    })
    .on('end', function () {
      t.deepEqual(result, ['CHARIZARD', 'PIKACHU', 'CHANSEY', 'MR. MIME'])
    })

  function uppercase (str) {
    return promisify(str.toString().toUpperCase())
  }
})

function promisify (n) {
  return new Promise(function (resolve, reject) {
    resolve(n)
  })
}
