var defined = require('defined')
var ndarray = require('ndarray')
var h = require('virtual-hyperscript-svg')

module.exports = oscilloscope

function oscilloscope (opts) {

  var numPoints = defined(opts.numPoints) || 400

  return render

  function render (state) {

    //console.log("state", state)
    return h('svg', {
      height: '100%',
      width: '100%',
      viewBox: '0 -1.1 1 2.4',
      preserveAspectRatio: 'none'
    }, [
      h('polyline', {
        stroke: defined(opts.stroke, 'cyan'),
        'stroke-width': defined(opts.strokeWidth, '0.005'),
        fill: 'transparent',
        points: getPoints(state)
          .map(function (p) {
            return p.x + ',' + p.y
          })
          .join(' ')
      })
    ])
  }

  function getPoints (state) {
    var points = new Array(numPoints)

    if (!defined(state)) {
      return points
    }

    var array = ndarray(state.data, state.shape, state.stride)

    for (var t = 0; t < numPoints; t++) {
      for (var c = 0; c < array.shape[1]; c++) {
        var s = Math.floor(t / numPoints * state.shape[0])
        var sample = Math.max(-1, Math.min(1, array.get(s, c)))

        points.push({
          x: (s / array.shape[0]),
          y: sample
        })
      }
    }

    return points
  }
}
