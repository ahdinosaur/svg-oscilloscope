var vdom = require('virtual-dom')
var main = require('main-loop')
var readAudio = require('read-audio')
var CBuffer = require('CBuffer')
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
  var bufShape = [opts.buffer * 10, opts.channels]
  var buf = CBuffer(size(bufShape))
  buf.fill(0)

  stream
  .pipe(writable.obj({
    highWaterMark: 1
  }, function (audio, enc, cb) {
    for (var i = 0; i < audio.shape[0]; i++) {
      buf.push(audio.data[i])
    }

    loop.update({
      stroke: linearGradientToVsvg(
        rainbowGradient({
          start: start
        })
      ),
      points: {
        data: buf,
        shape: bufShape
      }
    })

    start += inc
    cb()
  }))
})

document.body.appendChild(loop.target)

function size (shape) {
  return shape.reduce(mult)
}
function mult (a, b) { return a * b }
