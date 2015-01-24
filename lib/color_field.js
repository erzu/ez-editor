
var Field = require('./field')
var _ = require('@ali/belt')
var $ = require('@ali/yen')
var heredoc = require('heredoc')
var Crox = require('crox')
var ColorThief = require('../vendor/color_thief')


var n = 0
var _palette = ['#1abc9c', '#2ecc71', '#3498db', '#9b59b6', '#34495e',
                '#16a085', '#27ae60', '#2980b9', '#8e44ad', '#2c3e50',
                '#f1c40f', '#e67e22', '#e74c3c', '#ecf0f1', '#95a5a6',
                '#f39c12', '#d35400', '#c0392b', '#bdc3c7', '#7f8c8d']

function ColorField(p, opts) {
  this.id = '#j-editor-color-field' + n++
  this.property = p
  this.opts = _.extend({ palette: _palette }, opts)
}

_.inherits(ColorField, Field)

_.extend(ColorField.prototype, {
  template: heredoc(function(online) {/*
    <div id="{{ root.id }}" class="field" data-type="{{ root.type }}" data-property="{{ root.property }}">
      <input type="hidden" value="{{root.value}}">
      <div class="colorgroup"></div>
    </div>
  */}),

  bind: function() {
    if (this.opts.sourceImage)
      this.editor().on('image:load', this.onImageLoad.bind(this))
    else
      this.renderPalette(this.opts.palette)

    $(this.id).on('click', this.select.bind(this))
  },

  onImageLoad: function(e) {
    var imageField = e.el
    var source = this.opts.sourceImage

    if (imageField[0].parentNode.contains($(this.id)[0]) &&
        imageField.data('property') == source) {
      this.change(imageField.find('input').val())
    }
  },

  renderPalette: function(colors) {
    var template = heredoc(function(online){/*
      <div class="select-color">选择颜色</div>
      {{#each root.colors 'color'}}
      <div style="background :{{color}}" class="item" data-name="{{ color }}">
        <i class="iconfont correct"></i>
      </div>
      {{/each}}
    */})

    $(this.id).find('.colorgroup').html(Crox.render(template, { colors: colors}))
  },

  select: function(e) {
    var target = $(e.target)

    if (target.hasClass('correct')) {
      target = target.parent()
    }
    target = target.hasClass('item') ? target : false

    if (target) {
      $(this.id).find('.item').removeClass('selected')
      target.addClass('selected')
      $(this.id).find('input')
        .first()
        .attr('data-changed', true)
        .val(target.data('name'))
    }
  },

  change: function(value) {
    var el = $(this.id)
    var img = new Image()
    var self = this

    img.crossOrigin = 'anonymous'
    img.src = value
    img.onload = function() {
      var colorThief = new ColorThief()
      var colors = colorThief.imagePalette(img, 10, 10)
      var input = el.find('input').first()

      // Fix the colors returned, sometimes leading zero will be dropped.
      colors = colors.map(function(color) {
        while (color.length < 7) color = color.replace(/^#/, '#0')
        return color
      })
      input.val(colors[0])
      input.attr('data-changed', true)
      self.opts.value.color = colors[0]
      self.renderPalette(colors)
      el.find('[data-name="' + colors[0] + '"]')
        .addClass('selected')
    }
  }
})


module.exports = ColorField
