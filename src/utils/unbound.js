/***********************************************************************
@class decal
************************************************************************/

'use strict'

/***********************************************************************
@method unbound
@param {Any} value
************************************************************************/
module.exports = function (val) {
  return {
    value: val,
    __isUnbound: true
  }
}