
var Crox = require('crox')
var Field = require('./field')
var extend = require('extend-object')
var inherits = require('inherits')
var $ = require('yen')
var heredoc = require('heredoc')
var Crox = require('crox')

var n = 0
var cssTemplate = heredoc(function(oneline) {/*
  background:-moz-linear-gradient(left,{{root}});
  background:-webkit-linear-gradient(left,{{root}});
  background:linear-gradient(to right,{{root}});
*/})

function _pad2(str) {
  return str.length == 1 ? '0' + str : '' + str
}

// color should be in form #ccc or #cccccc
function _hexToRgb(color) {
  if (color.length === 4) { //for shorthand like #9F0
    color = "#" + color.charAt(1) + color.charAt(1) + color.charAt(2) + color.charAt(2) + color.charAt(3) + color.charAt(3)
  }
  color = parseInt(color.substr(1), 16)
  return { r: color >> 16, g: (color >> 8) & 255, b: color & 255 }
}

// expected input range: [0, 255]
// output range: [0, 360] for hue, [0, 1] for saturation and value
function _rgbToHsv(r, g, b) {
  r = r/255
  g = g/255
  b = b/255

  var max = Math.max(r, g, b), min = Math.min(r, g, b)
  var h, s, v = max
  var d = max - min
  s = max === 0 ? 0 : d / max

  if (max == min) {
    h = 0 // achromatic
  }
  else {
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      case b:
        h = (r - g) / d + 4
        break
    }

    h /= 6 // Range of this h value: [0, 1]
  }

  return { h: h * 360, s: s, v: v }
}

// expected input range: [0, 360] for hue, [0, 1] for saturation and value
// output range: [0, 255]
function _hsvToRgb(h, s, v) {
  h = h / 360 * 6

  var i = Math.floor(h),
      f = h - i,
      p = v * (1 - s),
      q = v * (1 - f * s),
      t = v * (1 - (1 - f) * s),
      mod = i % 6,
      r = [v, q, p, p, t, v][mod],
      g = [t, v, v, q, p, p][mod],
      b = [p, p, t, v, v, q][mod]

  return { r: r * 255, g: g * 255, b: b * 255 }
}

// expedted input range: [0, 360] for hue, [0, 1] for saturation and value
// output range: [0, 360] for hue, [0, 1] for saturation and lightness
function _hsvToHsl(h, s, v) {
  var l = (2 - s) * v / 2;

  if (l != 0) {
    if (l == 1) {
      s = 0
    } else if (l < 0.5) {
      s = s * v / (l * 2)
    } else {
      s = s * v / (2 - l * 2)
    }
  }

  return { h: h, s: s, l: l }
}

function _rgbToHex(r, g, b) {
  var hex = [
    _pad2(Math.round(r).toString(16)),
    _pad2(Math.round(g).toString(16)),
    _pad2(Math.round(b).toString(16))
  ]

  return '#' + hex.join('')
}

// HSV is the same as HSB
// In order to avoid confusion between the Value in HSV
// and the value of a DOM node, I use Brightness instead.
function HsvField(p, opts) {
  this.id = '#j-editor-hsv-field' + n++
  this.property = p
  this.opts = extend({ label: '颜色' }, opts)

  this._live = this.opts.live === true ? true : false
  this._dragging = false
  this._slider = null
}

inherits(HsvField, Field)

extend(HsvField.prototype, {
  template: heredoc(function(oneline) {/*
    <div id="{{ root.id }}" class="field hsv-field" data-type="{{ root.type }}" data-property="{{ root.property }}">
      <p class="field-label">{{ root.label }}</p>
      <input type="hidden" value="{{ root.value }}">
      <div class="hsv-sliders">
        <div class="hue container">
          <div class="hue-spectrum spectrum"></div>
          <div class="hue-slider slider"></div>
        </div>
        <div class="saturation container">
          <div class="saturation-spectrum spectrum"></div>
          <div class="saturation-slider slider"></div>
        </div>
        <div class="brightness container">
          <div class="brightness-spectrum spectrum"></div>
          <div class="brightness-slider slider"></div>
        </div>
      </div>
    </div>
  */}),

  bind: function() {
    var $el = $(this.id)
    var color = $el.find('input')[0].value
    var rgb = _hexToRgb(color)
    var hsv = _rgbToHsv(rgb.r, rgb.g, rgb.b)

    this.spectrums = {
      hue: $el.find('.hue-spectrum'),
      saturation: $el.find('.saturation-spectrum'),
      brightness: $el.find('.brightness-spectrum')
    }
    this.sliders = {
      hue: $el.find('.hue-slider'),
      saturation: $el.find('.saturation-slider'),
      brightness: $el.find('.brightness-slider')
    }
    this.renderSpectrums(hsv.h, hsv.s, hsv.v)
    this.renderSliders(hsv.h, hsv.s, hsv.v)

    $el.find('.hsv-sliders').on('mousedown', this.startDragging.bind(this))
    $(document)
    .on('mousemove', this.dragging.bind(this))
    .on('mouseup', this.stopDragging.bind(this))
  },

  change: function(h, s, v) {
    var rgb = _hsvToRgb(h, s, v)
    var hex = _rgbToHex(rgb.r, rgb.g, rgb.b)
    var input = $(this.id).find('input').first()

    this.renderSpectrums(h, s, v)

    if (this._live || !this._dragging) {
      input.val(hex).attr('data-changed', true)
      this.opts.value = hex
    }
  },

  renderSliders: function(h, s, v) {
    var $slider, $spectrum, offset

    $slider = this.sliders.hue
    $spectrum = this.spectrums.hue
    offset = h/360*$spectrum.width() - $slider.width()/2
    $slider.css('left', offset + 'px').data('value', h)

    $slider = this.sliders.saturation
    $spectrum = this.spectrums.saturation
    offset = s*$spectrum.width() - $slider.width()/2
    $slider.css('left', offset + 'px').data('value', s)

    $slider = this.sliders.brightness
    $spectrum = this.spectrums.brightness
    offset = v*$spectrum.width() - $slider.width()/2
    $slider.css('left', offset + 'px').data('value', v)
  },

  renderSpectrums: function(h, s, v) {
    this.renderHue(s, v)
    this.renderSaturation(h, v)
    this.renderBrightness(h, s)
  },

  renderHue: function(s, v) {
    var hsl = _hsvToHsl(0, s, v)
    var h = 0
    var l = Math.round(hsl.l * 100)
    s = Math.round(hsl.s * 100)

    var pos = 0
    var gradient = []

    while (h < 361) {
      gradient.push('hsl(' + h + ',' + s + '%,' + l + '%) ' + pos + '%')

      h += 15
      pos += 4
    }

    this.spectrums.hue.attr('style', Crox.render(cssTemplate, gradient.join(',')))
  },

  renderSaturation: function(h, v) {
    var rgb0 = _hsvToRgb(h, 0, v)
    var rgb1 = _hsvToRgb(h, 1, v)
    var hex0 = _rgbToHex(rgb0.r, rgb0.g, rgb0.b)
    var hex1 = _rgbToHex(rgb1.r, rgb1.g, rgb1.b)

    var gradient = hex0 + ' 0%,' + hex1 + ' 100%'

    this.spectrums.saturation.attr('style', Crox.render(cssTemplate, gradient))
  },

  renderBrightness: function(h, s) {
    var hsl = _hsvToHsl(h, s, 1)
    var l = Math.round(hsl.l * 100)
    s = Math.round(hsl.s * 100)

    var gradient = '#000000 0%, hsl(' + h + ',' + s + '%,' + l + '%) 100%'

    this.spectrums.brightness.attr('style', Crox.render(cssTemplate, gradient))
  },

  startDragging: function(e) {
    var $el = $(this.id)
    var $t = $(e.target)
    var targetClass = $t.attr('class')

    if (targetClass.indexOf('hue') > -1) {
      this._slider = $el.find('.hue-slider')
    }
    else if (targetClass.indexOf('saturation') > -1) {
      this._slider = $el.find('.saturation-slider')
    }
    else if (targetClass.indexOf('brightness') > -1) {
      this._slider = $el.find('.brightness-slider')
    }

    this._dragging = true
    this.redraw(e)
  },

  dragging: function(e) {
    if (this._dragging) {
      this.redraw(e)
    }
  },

  stopDragging: function(e) {
    this._dragging = false

    if (!this._live) {
      this.redraw(e)
    }

    this._slider = null
  },

  redraw: function(e) {
    var mouseX = e.pageX

    var $slider = this._slider
    if (!$slider) return

    var $spectrum = $slider.prev()

    var l = $spectrum.offset().left
    var r = l + $spectrum.width()

    if (mouseX < l) mouseX = l
    else if (mouseX > r) mouseX = r

    offset = mouseX - l - $slider.width()/2
    $slider.css('left', offset + 'px')

    if ($slider.hasClass('hue-slider')) {
      $slider.data('value', (mouseX - l)/$spectrum.width()*360)
    }
    else {
      $slider.data('value', (mouseX - l)/$spectrum.width())
    }

    var h = parseFloat(this.sliders.hue.data('value'))
    var s = parseFloat(this.sliders.saturation.data('value'))
    var v = parseFloat(this.sliders.brightness.data('value'))

    this.change(h, s, v)
  }
})

module.exports = HsvField