var defined = require('defined')
var ndarray = require('ndarray')
var h = require('virtual-hyperscript-svg')
var isVnode = require('virtual-dom/vnode/is-vnode')

module.exports = oscilloscope

function oscilloscope (opts) {
  opts = defined(opts, {})

  var numPoints = defined(opts.numPoints) || 512

  return render

  function render (state) {
    state = state == null ? {} : state

    var stroke = state.stroke
    var strokeDef = getStrokeDef(stroke)

    //console.log("state", state)
    return h('svg', {
      height: '100%',
      width: '100%',
      viewBox: '0 -1 1 2',
      preserveAspectRatio: 'none'
    }, [
      h('defs', [
        strokeDef
      ]),
      h('polyline', {
        stroke: defined(
          strokeDef && getDefId(strokeDef),
          stroke, 'cyan'
        ),
        'stroke-width': defined(opts.strokeWidth, '0.005'),
        fill: 'transparent',
        points: getPoints(state.points)
          .map(function (p) {
            return p[0] + ',' + p[1]
          })
          .join(' ')
      })
    ])
  }

  function getPoints (raw) {
    var points = new Array(numPoints)

    if (!defined(raw)) {
      return points
    }

    var array = ndarray(raw.data, raw.shape, raw.stride, raw.offset)

    for (var p = 0; p < numPoints; p++) {
      for (var c = 0; c < array.shape[1]; c++) {
        var t = Math.floor(p / numPoints * array.shape[0])
        var sample = Math.max(-1, Math.min(1, array.get(t, c)))

        points[p] = new Float32Array([
          t / array.shape[0],
          sample
        ])
      }
    }

    return points
  }
}

function getStrokeDef (stroke) {
  if (isVnode(stroke)) {
    var stroke = stroke
    setDefId(stroke, 'stroke')
    return stroke
  }
}

function getDefId (def) {
  return 'url(#' + def.properties.id + ')'
}

function setDefId (def, id) {
  def.properties.id = 'oscilloscope-' + id
}
