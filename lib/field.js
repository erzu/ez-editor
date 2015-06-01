

var Crox = require('crox')
var _ = require('@ali/belt')
var $ = require('yen')
var heredoc = require('heredoc')
require('yen/events')

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
  this.opts = obj
  this.id = '#j-editor-field' + n++
}


_.extend(PField.prototype, {
  template: heredoc(function(oneline) {/*
    <div id="{{ root.id }}" class="field" data-type="{{ root.type }}" data-property="{{ root.property }}">
      <input class="field-block" type="text" value="{{ root.value }}">
      <p class="error"></p>
    </div>
  */}),

  render: function() {
    return Crox.render(this.template, _.extend({}, this.opts, { property: this.property, id: this.id.slice(1) }))
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
        e.keyCode != KEY_SPACE &&
        e.keyCode != KEY_ENTER &&
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
    var input = $(e.target)
    var tip = input.next('p')
    var error = this.validate(input)

    if (error) {
      tip.html(error)
      tip.show()
    }
    else {
      tip.hide()
    }

    if (this.opts.value !== input.val()) {
      $(this.id).attr('data-changed', true)
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
      return '已超过 ' + Math.ceil(exceedance / 2) + ' 个字！'
    }

    if (minLength && lack > 0) {
      return '还缺少 ' + Math.ceil(lack / 2) + ' 个字！'
    }
  },

  editor: function() {
    var n = this
    while (n.parent) n = n.parent
    return n
  }
})


module.exports = PField
