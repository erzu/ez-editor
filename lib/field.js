

var Crox = require('crox')
var extend = require('extend-object')
var $ = require('yen')
var heredoc = require('heredoc')

var KEY_ENTER = 13
var KEY_SPACE = 32
var KEY_0 = 48
var KEY_9 = 57
var KEY_PAD_0 = 96
var KEY_PAD_9 = 105

var KEY_LEFT = 37
var KEY_DOWN = 40


var n = 0

function PField(p, obj) {
  this.property = p
  this.opts = extend({ label: '文本', placeholder: '请填写文本' }, obj)
  this.id = '#j-editor-field' + n++
}


extend(PField.prototype, {
  el: function() {
    return $(this.id)
  },

  template: heredoc(function(oneline) {/*
    <div id="{{ root.id }}" class="field text-field" data-type="{{ root.type }}" data-property="{{ root.property }}">
      <p class="field-label">{{ root.label }}</p>
      <input type="text" value="{{ root.value }}" placeholder="{{ root.placeholder }}">
      <p class="error"></p>
    </div>
  */}),

  render: function() {
    var data = extend({}, this.opts, {
      property: this.property, id: this.id.slice(1)
    })

    return Crox.render(this.template, data)
  },

  bind: function() {
    // more keyCode info:
    // - http://www.cambiaresearch.com/articles/15/javascript-char-codes-key-codes
    // - http://asquare.net/javascript/tests/KeyCode.html
    $(this.id).find('input[type="text"]')
      .on('keyup', this.onKeyUp.bind(this))
      .on('keydown', function(e) {
        // When using Chinese input, Firefox just ignores
        // keydown/keyup event after first character typed;
        // Chrome, Safari, IE give a keyCode of 229 on keydown
        e.target._chnInput = e.keyCode === 229
      })
      .on('blur', this.change.bind(this))
  },

  onKeyUp: function(e) {
    // possible ways of quiting input method
    if (e.target._chnInput &&
        e.keyCode !== KEY_SPACE &&
        e.keyCode !== KEY_ENTER &&
        !(e.keyCode >= KEY_0 && e.keyCode <= KEY_9) &&
        !(e.keyCode >= KEY_PAD_0 && e.keyCode <= KEY_PAD_9)) {
      return
    }

    // playing with arrows, nothing changed...
    if (e.keyCode >= KEY_LEFT && e.keyCode <= KEY_DOWN) {
      return
    }

    this.change(e)
  },

  change: function(e) {
    var el = this.el()
    var input = $(e.target)
    var tip = input.next('p')

    try {
      this.validate(input)
      el.removeClass('field-error')
    } catch (error) {
      tip.html(error.message)
      el.addClass('field-error')
      return
    }

    if (this.opts.value !== input.val()) {
      el.attr('data-changed', true)
      this.opts.value = input.val()
    }
  },

  validate: function(input) {
    var maxLength = this.opts.maxLength * 2
    var minLength = this.opts.minLength * 2
    var value = input.val()
    var length = 0

    for (var i = 0; i < value.length; i++) {
      length += value.charCodeAt(i) > 255 ? 2 : 1
    }
    var exceedance = length - maxLength
    var lack = minLength - length

    if (maxLength && exceedance > 0) {
      throw new Error('已超过 ' + Math.ceil(exceedance / 2) + ' 个字！')
    }

    if (minLength && lack > 0) {
      throw new Error('还缺少 ' + Math.ceil(lack / 2) + ' 个字！')
    }
  },

  editor: function() {
    var node = this
    while (node.parent) node = node.parent
    return node
  }
})


module.exports = PField
