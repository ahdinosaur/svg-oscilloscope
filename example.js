var vdom = require('virtual-dom')
var main = require('main-loop')
var readAudio = require('read-audio')
var CBuffer = require('CBuffer')

var Scope = require('./')

var scope = Scope({})

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
  .on('data', function (audio) {
    for (var i = 0; i < audio.shape[0]; i++) {
      buf.push(audio.data[i])
    }
    //console.log("audio", c++, audio)
    loop.update({
      data: buf,
      shape: bufShape
    })
  })
  .resume()
})

document.body.appendChild(loop.target)

function size (shape) {
  return shape.reduce(mult)
}
function mult (a, b) { return a * b }
