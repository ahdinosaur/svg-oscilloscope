var vdom = require('virtual-dom')
var main = require('main-loop')
var readAudio = require('read-audio')
var hop = require('ndarray-hop/stream')
var writable = require('writable2')
var h = require('virtual-hyperscript-svg')

var rainbowGradient = require('rainbow-linear-gradient')
var linearGradientToVsvg = require('linear-gradient-svg')

var Scope = require('./')

var opts = {
  buffer: 1024,
  channels: 1,
  inc: 1
}

var scope = Scope()

var loop = main(
  null,
  scope,
  vdom
)

readAudio(opts, function (err, stream) {
  if (err) { throw err }

  var start = 0
  var inc = opts.inc

  stream
  .pipe(hop({
    frame: { shape: [opts.buffer * 10, opts.channels] },
    hop: { shape: [opts.buffer, opts.channels] },
    dtype: 'float32'
  }))
  .pipe(writable.obj({
    highWaterMark: 1
  }, function (audio, enc, cb) {
    loop.update({
      stroke: linearGradientToVsvg(
        rainbowGradient({
          start: start
        })
      ),
      points: audio
    })

    start += inc
    cb()
  }))
})

document.body.appendChild(loop.target)
