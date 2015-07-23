var ndarray = require('ndarray')
var vdom = require('virtual-dom')
var main = require('main-loop')
var readAudio = require('read-audio')
var hop = require('ndarray-hop/stream')
var writable = require('writable2')
var h = require('virtual-hyperscript-svg')
var Slider = require('range-slider')

var rainbowGradient = require('rainbow-linear-gradient')
var linearGradientToVsvg = require('linear-gradient-svg')

var Scope = require('./')

var opts = {
  buffer: 1024,
  channels: 1,
  inc: 1,
  numPoints: 512,
  numStops: 32
}

var scope = Scope()

var loop = main(
  null,
  scope,
  vdom
)

var zoom = 1
var slider = Slider(
  document.querySelector('#slider'),
  zoom,
  function (newZoom) {
    zoom = newZoom
  }
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
    var min = opts.numPoints
    var xShape = Math.max(Math.ceil(audio.shape[0] * zoom), min)
    var offset = Math.floor(audio.data.length * (1 - zoom), 0)
    offset = audio.shape[0] - offset < min ? audio.shape[0] - min : offset

    var points = ndarray(
      audio.data,
      [xShape, audio.shape[1]],
      audio.stride,
      offset
    )

    loop.update({
      stroke: linearGradientToVsvg(
        rainbowGradient({
          start: start,
          length: opts.numStops
        })
      ),
      points: points
    })

    start += inc
    cb()
  }))
})

document.body.appendChild(loop.target)
