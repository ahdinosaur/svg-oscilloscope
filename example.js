var vdom = require('virtual-dom')
var main = require('main-loop')
var readAudio = require('read-audio')
var CBuffer = require('CBuffer')
var writable = require('writable2')
var h = require('virtual-hyperscript-svg')

var Scope = require('./')

var scope = Scope({
  stroke: h('linearGradient', {
    x1: '0%',
    y1: '0%',
    x2: '100%',
    y2: '0%'
  }, [
    h('stop', { offset: '0%', 'stop-color': 'red' }),
    h('stop', { offset: '14%', 'stop-color': 'orange' }),
    h('stop', { offset: '28%', 'stop-color': 'yellow' }),
    h('stop', { offset: '42%', 'stop-color': 'green' }),
    h('stop', { offset: '56%', 'stop-color': 'blue' }),
    h('stop', { offset: '70%', 'stop-color': 'indigo' }),
    h('stop', { offset: '84%', 'stop-color': 'violet' }),
    h('stop', { offset: '100%', 'stop-color': 'red' })
  ])
})

var loop = main(
  null,
  scope,
  vdom
)

var opts = {
  buffer: 1024,
  channels: 1
}

readAudio(opts, function (err, stream) {
  if (err) { throw err }

  var c = 0
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
    //console.log("audio", c++, audio)
    loop.update({
      data: buf,
      shape: bufShape
    })

    cb()
  }))
})

document.body.appendChild(loop.target)

function size (shape) {
  return shape.reduce(mult)
}
function mult (a, b) { return a * b }
