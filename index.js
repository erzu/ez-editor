'use strict';

var $ = require('@ali/yen')
var _ = require('@ali/belt')

var Model = require('./lib/model')
var Collection = require('./lib/collection')
var Mixed = require('./lib/mixed')

var Field = require('./lib/field')
var ImageField = require('./lib/image_field')
var NumberField = require('./lib/number_field')
var LinkField = require('./lib/link_field')
var ClipField = require('./lib/clip_field')
var HiddenField = require('./lib/hidden_field')
var VideoField = require('./lib/video_field')
var ColorField = require('./lib/color_field')

var E = $.Events


var TypeMap = {
  number: NumberField,
  image: ImageField,
  url: LinkField,
  clip: ClipField,
  hidden: HiddenField,
  video: VideoField,
  color: ColorField,
  text: Field
}

function createModel(metadata, data) {
  var parent = new Model()
  var path = []

  function describe(p, obj) {
    var Class
    var collection
    var model
    var mixed
    var element
    var i

    function addChild(child) {
      child.parent = parent

      if (parent instanceof Collection)
        parent.models.push(child)
      else
        parent.columns.push(child)
    }

    if (obj.type !== 'mixed') path.push(p)

    obj = _.extend({}, obj)
    obj.value = path.reduce(function(data, p) {
      return data[p]
    }, data) || obj.value

    switch (obj.type) {
      case 'object':
        model = new Model(p, { title: obj.title })
        addChild(model)
        parent = model
        for (p in obj.columns) {
          describe(p, obj.columns[p])
        }
        parent = model.parent
        break
      case 'array':
        collection = new Collection(p)
        addChild(collection)
        parent = collection
        element = obj.element || { type: 'object', columns: obj.columns }
        for (i = 0; i < obj.length; i++) {
          describe(i, element)
        }
        parent = collection.parent
        break
      case 'mixed':
        mixed = new Mixed(p)
        addChild(mixed)
        parent = mixed
        for (i = 0; i < obj.columns.length; i++) {
          describe(p, obj.columns[i])
        }
        parent = mixed.parent
        break
      default:
        Class = TypeMap[obj.type] || TypeMap.text
        addChild(new Class(p, obj))
    }

    path.pop()
  }

  for (var p in metadata.columns) {
    describe(p, metadata.columns[p])
  }

  return parent
}

function Editor(id, opts) {
  this.id = id
  this.data = opts.data
  this.metadata = opts.metadata

  this.opts = {
    interval: 400
  }
}

_.extend(Editor.prototype, {
  el: function() {
    return $(this.id)
  },

  set: function(p, v) {
    this[p] = v
    return this
  },

  end: function(fn) {
    this.render()
    this.bind()
    fn.call(this)

    return this
  },

  render: function() {
    var metadata = this.metadata
    var data = this.data

    this.model = createModel(metadata, data)
    this.model.parent = this

    if (metadata) {
      this.el().html(this.model.render())
    }
  },

  bind: function() {
    var self = this
    var interval = this.opts.interval
    var timer

    function later(fn) {
      if (timer) clearTimeout(timer)
      timer = setTimeout(fn, interval)
    }

    function poll() {
      var root = self.el().find('.model').first()

      if (root.find('[data-changed]').length > 0) {
        self.edited = true
        self.trigger('change', { data: self.dump() })
        root.find('[data-changed]').removeAttr('data-changed')
      }

      later(poll)
    }

    this.model.bind()
    $('.j-save').on('click', this.save.bind(this))

    this.on('metadata', this.syncMetadata.bind(this))
    this.on('collection:switch', this.switchTo.bind(this))

    later(poll)
  },

  syncMetadata: function(e) {
    if (!e.path || !e.path.length) return

    var opts = e.path.reduce(function(result, p) {
      return result.columns[p]
    }, this.stage.metadata)

    if (e.value) _.extend(opts, e.value)
  },

  switchTo: function(e) {
    var path = [].concat(e.path)
    var index = path.pop()
    var collection = this.model.queryPath(path)

    collection.switchTo(index, true)
  },

  dump: function() {
    var path = []
    var obj = {}
    var root = this.el().find('.model').first()

    function dig(el, data) {
      el = $(el)
      var p = el.data('property')
      var obj = path.reduce(function(obj, p) {
        return obj[p]
      }, data)

      if (el.hasClass('mixed')) {
        var index = el.find('.radios .current').data('index')
        dig(el.find('.frame').get(index), data)
      }
      else if (el.hasClass('model') || el.hasClass('collection')) {
        path.push(p)
        obj[p] = el.hasClass('collection') ? [] : {}
        el.children().each(function(child) {
          dig(child, data)
        })
        path.pop()
      }
      else if (el.hasClass('field')) {
        var input = el.find('input')

        obj[p] = input.hasAttr('data-json') ? JSON.parse(input.val()) : input.val()
      }
      else {
        el.children().each(function(child) {
          dig(child, data)
        })
      }
      el = null
    }

    root.children().each(function(child) {
      dig(child, obj)
    })

    return obj
  },

  save: function(e) {
    if ($(e.target).hasAttr('processing')) return

    e.preventDefault()
    this.disableSubmit('正在保存……')
    this.submit()
  },

  submit: function() {
    var data = this.dump()

    if (this.validate && !this.validate(data, this.metadata)) {
      this.enableSubmit()
      return
    }

    this.edited = false
    this.trigger('submit', { data: data })
  },

  trigger: function(type, opts) {
    return E.trigger(this, _.extend({ type: type, target: this }, opts))
  },

  on: function(type, fn) {
    E.on(this, type, fn)
    return this
  },

  off: function(type, fn) {
    E.off(this, type, fn)
    return this
  },

  registerType: function(type, Class) {
    TypeMap[type] = Class
    return this
  },

  disableSubmit: function(message) {
    var el = $('.j-save')
      .attr('processing', true)
      .addClass('btn-disabled')

    if (message) el.html(message)
  },

  enableSubmit: function() {
    $('.j-save')
      .removeAttr('processing')
      .removeClass('btn-disabled')
      .html('完成')
  }
})


Editor.Field = Field
Editor.HiddenField = HiddenField

module.exports = Editor
