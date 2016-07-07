'use strict'

const get = require('../utils/get')
const EventEmitter = require('events')

const EMITTER_METHODS = [
  'addListener', 'emit', 'eventNames', 'getMaxListeners', 'listenerCount', 'listeners',
  'on', 'once', 'prependListener', 'prependOnceListener', 'removeAllListeners', 'removeListener', 'setMaxListeners'
]

const EMITTERS = new Map()
const LISTENERS = new Map()

function addItemEvent (arr, event) {
  let listeners = LISTENERS.get(arr)
  if (!listeners[event]) {
    listeners[event] = new Map()
    arr.forEach(item => addItemListener(arr, item, event))
  }
}

function removeItemEvent (arr, event) {
  let listeners = LISTENERS.get(arr)
  if (listeners[event]) {
    listeners[event].forEach((handler, item) => item.removeListener(event, handler))
    listeners[event].clear()
    delete listeners[event]
  }
}

function addItemListener (arr, item, event) {
  let listeners = LISTENERS.get(arr)
  let handler = function (...args) {
    arr.emit('item.' + event, item, ...args)
  }
  item.addListener(event, handler)
  listeners[event].set(item, handler)
}

function onAdd (arr, item, emit) {
  if (emit !== false) arr.emit('add', item)
  if (typeof item.addListener === 'function') {
    let listeners = LISTENERS.get(arr)
    for (let p in listeners) addItemListener(arr, item, p)
  }
}

function onRemove (arr, item) {
  arr.emit('remove', item)
  let listeners = LISTENERS.get(arr)
  for (let p in listeners) {
    let handler = listeners[p].get(item)
    if (handler) {
      listeners[p].delete(item)
      item.removeListener(p, handler)
    }
  }
}

class DecalArray extends Array {

  static create (...args) {
    return new this(...args)
  }

  constructor (...args) {
    super(...args)
    EMITTERS.set(this, new EventEmitter())
    LISTENERS.set(this, {})
    args.forEach(item => onAdd(this, item, false))
    return this
  }

  concat (...args) {
    let val = super.concat(...args)
    return this.constructor.create(...val)
  }

  findBy (key, val) {
    return this.find(item => get(item, key) === val)
  }

  filterBy (key, val) {
    return this.filter(item => get(item, key) === val)
  }

  insertAt (i, item) {
    this.splice(i, 0, item)
  }

  push (...args) {
    let l = super.push(...args)
    args.forEach(item => onAdd(this, item))
    return l
  }

  pop (i) {
    let item = super.pop()
    onRemove(this, item)
    return item
  }

  remove (item) {
    let i = this.indexOf(item)
    if (~i) this.removeAt(i)
    return i
  }

  removeAt (i) {
    return this.splice(i, 1)
  }

  replace (toReplace, replacement) {
    let i = this.indexOf(toReplace)
    if (~i) this.replaceAt(i, replacement)
    return i
  }

  replaceAt (i, item) {
    this.removeAt(i)
    this.insertAt(i, item)
  }

  splice (start, deleteCount, ...itemsToAdd) {
    if (typeof deleteCount === 'undefined') deleteCount = this.length - start
    let removed = super.splice(start, deleteCount)
    removed.forEach(item => onRemove(this, item))

    if (itemsToAdd && itemsToAdd.length) {
      for (let i = itemsToAdd.length - 1; i >= 0; i--) {
        super.splice(start, 0, itemsToAdd[i])
      }
    }

    return removed
  }

  shift () {
    let removed = super.shift()
    onRemove(this, removed)
    return removed
  }

  unshift (...args) {
    let l = super.unshift(...args)
    args.forEach(item => onAdd(this, item))
    return l
  }

  toArray () {
    let a = []
    for (let i = 0; i < this.length; i++) a.push(this[i])
    return a
  }

  on (event, listener) {
    return this.addListener(event, listener)
  }

  off (event, listener) {
    return this.removeListener(event, listener)
  }

  addListener (event, listener) {
    if (~event.indexOf('item.')) addItemEvent(this, event.split('item.')[1])
    return EMITTERS.get(this).addListener(event, listener)
  }

  removeListener (event, listener) {
    if (~event.indexOf('item.')) removeItemEvent(this, event.split('item.')[1])
    return EMITTERS.get(this).removeListener(event, listener)
  }

  removeAllListeners (event) {
    if (~event.indexOf('item.')) removeItemEvent(this, event.split('item.')[1])
    if (!event) LISTENERS.get(this).clear()
    return EMITTERS.get(this).removeAllListeners(event)
  }

  empty () {
    this.splice(0, this.length)
  }

  replaceWith (...args) {
    this.empty()
    this.push(...args)
  }

  destroy () {
    this.emit('destroy')
    this.empty()
    EMITTERS.get(this).removeAllListeners()
    EMITTERS.delete(this)
    LISTENERS.delete(this)
  }
}

EMITTER_METHODS.forEach(name => {
  if (DecalArray.prototype[name]) return
  DecalArray.prototype[name] = function (...args) {
    return EMITTERS.get(this)[name](...args)
  }
})

module.exports = DecalArray
