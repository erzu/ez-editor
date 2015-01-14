var Crox = require('crox')
var _ = require('@ali/belt')
var $ = require('@ali/yen')
var heredoc = require('heredoc')


var n = 0

function Collection(p) {
  this.property = p || 'items'
  this.models = []
  this.id = '#j-editor-collection' + n++
}

_.extend(Collection.prototype, {
  render: function() {
    return Crox.render(heredoc(function(oneline) {/*
      <div id="{{ root.id }}" class="collection" data-property="{{ root.property }}">
        <div class="triggers dib-box">{{{ root.triggers }}}</div>
        <div class="frames dib-box">{{{ root.models }}}</div>
      </div>
    */}), {
      models: this.models.map(function(model) {
        return model.render()
      }).join(''),
      triggers: this.models.map(function(model, i) {
        return '<span class="dib trigger">' + (i + 1) + '</span>'
      }).join(''),
      id: this.id.slice(1),
      property: this.property
    })
  },

  bind: function() {
    this.models.forEach(function(model) {
      model.bind()
    })

    this.find('input').on('focus', this.followFocus.bind(this))

    // There might collections within collection. To avoid selecting too much
    // span.trigger, we must limit the context el to the very first div.triggers.
    this.find('.trigger').each(function(trigger, i) {
      trigger.setAttribute('data-index', i)
    })

    // Same reason on why we can not just bind click event on this.el()
    this.find('.triggers').on('click', this.onSwitch.bind(this))

    this.sync()
  },

  followFocus: function(e) {
    var indexWas = this.find('.triggers .current').data('index')
    var indexWillBe = $(e.target).parent('.frame').data('property')

    if (indexWillBe != indexWas) {
      setTimeout(function() {
        $(this.id)[0].scrollLeft = 0
        this.switchTo(indexWillBe)
        this.triggerEvent(indexWillBe)
      }.bind(this), 10)
    }
  },

  find: function(selector) {
    var els = $(this.id).find(selector)
    var arr = []

    for (var i = els.length - 1; i >= 0; i--) {
      var el = $(els[i])

      if (el.parent('.collection').attr('id') == this.id.slice(1)) {
        arr.unshift(el[0])
      }
    }

    return $(arr)
  },

  onSwitch: function(e) {
    var target = $(e.target)
    var i = target.data('index')

    if (target.hasClass('trigger')) {
      this.switchTo(i)
      this.triggerEvent(i)
    }
  },

  triggerEvent: function(i) {
    var el = this.el()
    var path = [el.data('property')]
    var parent = el.parent('[data-property]')

    while (parent.length > 0 && parent.data('property') !== 'root') {
      path.unshift(parent.data('property'))
      parent = parent.parent('[data-property]')
    }

    path.push(i)

    var editor = $('#editor')
    var e = {
      type: 'collection:switch',
      target: editor,
      path: path
    }

    editor.trigger(e)
  },

  sync: function() {
    var el = this.el()
    var width = el.width()
    var frames = this.find('.frame')
    var gap = parseInt(frames.css('margin-right'), 10)

    this.frameWidth = width + (isNaN(gap) ? 0 : gap)

    el.css('width', width)
    frames.css('width', width)

    this.find('.frames').css('width', frames.length * this.frameWidth)
    this.find('.trigger').first().addClass('current')
  },

  switchTo: function(i) {
    var triggers = this.find('.trigger')
    var frames = this.find('.frames')

    if (triggers.get(i).length === 0) {
      triggers.removeClass('current')
      frames.hide()
    }
    else {
      triggers
        .removeClass('current')
        .get(i).addClass('current')

      frames
        .show()
        .css('margin-left', -this.frameWidth * i + 'px')
    }
  },

  el: function() {
    return $(this.id)
  }
})


module.exports = Collection
