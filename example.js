var main = require('main-loop')
var vdom = require('virtual-dom')

var Scope = require('./')

var scope = Scope({})

var loop = main(
  {
    n: 0
  },
  scope,
  vdom
)

document.body.appendChild(loop.target)
