var Crox = require('crox')
var extend = require('extend-object')
var $ = require('yen')
var heredoc = require('heredoc')


var n = 0

function Collection(p) {
  this.property = p || 'items'
  this.columns = []
  this.id = '#j-editor-collection' + n++
}

extend(Collection.prototype, {
  render: function() {
    return Crox.render(heredoc(function(oneline) {/*
      <div id="{{ root.id }}" class="collection" data-property="{{ root.property }}">
        <div class="triggers dib-box">
        {{#forin root.columns 'column' 'index'}}
          <span class="dib trigger">{{1 + parseInt(index, 10)}}</span>
        {{/forin}}
        </div>
        <div class="content-wrapper">
          <div class="frames dib-box">
          {{#forin root.columns 'column' 'index'}}
            <div class="dib frame" data-index="{{index}}">{{{ column.render() }}}</div>
          {{/forin}}
          </div>
        </div>
      </div>
    */}), {
      columns: this.columns,
      triggers: this.columns,
      id: this.id.slice(1),
      property: this.property
    })
  },

  bind: function() {
    this.columns.forEach(function(model) {
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
  },

  followFocus: function(e) {
    var indexWas = this.find('.triggers .current').data('index')
    var indexWillBe = $(e.target).closest('.frame').data('index')

    if (indexWillBe !== indexWas) {
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

      if (el.closest('.collection').attr('id') === this.id.slice(1)) {
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
    var parent = el.parent().closest('[data-property]')

    while (parent.length && parent.data('property') !== 'root') {
      path.unshift(parent.data('property'))
      parent = parent.parent().closest('[data-property]')
    }

    path.push(i)

    this.editor().trigger('collection:switch', { path: path })
  },

  sync: function() {
    var el = this.el()
    var width = el.width() - parseInt(el.css('border-left-width'), 10) - parseInt(el.css('border-right-width'), 10)
    var wrapper = this.find('.content-wrapper')
    var frames = this.find('.frame')
    var gap = parseInt(frames.css('margin-right'), 10)

    el.css('width', width)
    frames.css('width', width - parseInt(wrapper.css('margin-left'), 10) - parseInt(wrapper.css('margin-right'), 10))

    this.frameWidth = frames.width() + (isNaN(gap) ? 0 : gap)
    this.find('.frames').css('width', frames.length * this.frameWidth)
    this.find('.trigger').first().addClass('current')

    this.columns.forEach(function(column) {
      if (column.sync) column.sync()
    })
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
  },

  editor: function() {
    var node = this
    while (node.parent) node = node.parent
    return node
  }
})


module.exports = Collection
