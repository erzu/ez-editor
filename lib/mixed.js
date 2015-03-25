var Crox = require('crox')
var _ = require('@ali/belt')
var $ = require('@ali/yen')
var heredoc = require('heredoc')


var n = 0

function Mixed(p) {
  this.property = p
  this.columns = []
  this.id = '#j-editor-mixed' + n++
  this.selected = 0
}

_.extend(Mixed.prototype, {
  render: function() {
    var id = this.id.slice(1)
    var radios = this.columns.map(function(column, i) {
      return Crox.render(heredoc(function() {/*
        <label class="radio {{#if root.first}}current{{/if}}" for="{{ root.radioId }}" data-index="{{ root.index }}">
          <input type="radio" name="{{ root.id }}" id="{{ root.radioId }}" {{#if root.first}}checked{{/if}}>
          {{ root.title }}
        </label>
      */}), {
        first: i === 0,
        index: i,
        id: id,
        radioId: id + '-title' + i,
        title: column.opts.title
      })
    })

    return Crox.render(heredoc(function(oneline) {/*
      <div id="{{ root.id }}" class="mixed" data-property="{{ root.property }}">
        <div class="radios clearfix">{{{ root.radios }}}</div>
        <div class="frames dib-box">{{{ root.columns }}}</div>
      </div>
    */}), {
      columns: this.columns.map(function(column) {
        return column.render()
      }).join(''),
      radios: radios.join(''),
      id: id,
      property: this.property
    })
  },

  bind: function() {
    this.columns.forEach(function(column) {
      column.bind()
    })

    this.el().find('.radio').on('click', this.onSwitch.bind(this))

    this.el().find('.frames input').on('focus', this.followFocus.bind(this))

    this.el().find('.frames').children()
      .each(function(frame, i) {
        frame.setAttribute('data-index', i)
      })
      .attr('data-disabled', '')
      .addClass('frame')
      .addClass('dib')
      .get(this.selected).removeAttr('data-disabled')

    this.sync()
  },

  followFocus: function(e) {
    var indexWas = this.el().find('.radios .current').data('index')
    var indexWillBe = $(e.target).parent('.frame').data('index')

    if (indexWillBe != indexWas) {
      setTimeout(function() {
        $(this.id)[0].scrollLeft = 0
        this.el().find('input[type="radio"]')[indexWillBe].checked = true
        this.switchTo(indexWillBe)
      }.bind(this), 1)
    }
  },

  onSwitch: function(e) {
    var target = $(e.target)

    target = target.hasClass('radio') ? target : target.parent('.radio')

    if (target.hasClass('radio')) {
      this.switchTo(~~target.data('index'))
    }
  },

  sync: function() {
    var el = this.el()
    var width = el.width()
    var frames = el.find('.frame')
    var gap = parseInt(frames.css('margin-right'), 10)

    this.frameWidth = width + (gap > 0 ? gap : 0)

    frames.css('width', width)
    el.css('width', width)
    el.find('.frames').css('width', frames.length * this.frameWidth)
  },

  switchTo: function(i) {
    var el = this.el()
    var radios = el.find('.radio')
    var framesBox = el.find('.frames')

    var path = []
    var parent = this

    while (parent && parent.property != 'root') {
      path.unshift(parent.property)
      parent = parent.parent
    }

    this.editor().trigger('editor:metadata', {
      path: path,
      value: { selected: i }
    })

    radios
      .removeClass('current')
      .get(i).addClass('current')

    framesBox
      .show()
      .css('margin-left', -this.frameWidth * i + 'px')

    framesBox.find('.frame')
      .attr('data-disabled', '')
      .get(i).removeAttr('data-disabled')

    this.selected = i
  },

  el: function() {
    return $(this.id)
  },

  editor: function() {
    var n = this
    while (n.parent) n = n.parent
    return n
  }
})


module.exports = Mixed

