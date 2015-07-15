

var Field = require('./field')

var extend = require('extend-object')
var inherits = require('inherits')
var heredoc = require('heredoc')
var $ = require('yen')


var n = 0

function NumberField(p, opts) {
  this.id = '#j-editor-number-field-' + n++
  this.property = p
  this.opts = extend({ label: '数字', placeholder: '请填写数字' }, opts)
}


inherits(NumberField, Field)

extend(NumberField.prototype, {
  template: heredoc(function(oneline) {/*
    <div id="{{ root.id }}" class="field" data-type="{{ root.type }}" data-property="{{ root.property }}">
      <p class="field-label">{{ root.label }}</p>
      <input class="field-block" type="text" value="{{ root.value }}" placeholder="{{ root.placeholder }}">
      <p class="error"></p>
    </div>
  */}),

  /*
   * input.val() shall be coerced into number before comparing the previous
   * value. Let's just override Field.prototype.change.
   */
  change: function(e) {
    var input = $(e.target)
    var tip = input.next('p')

    try {
      this.validate(input)
      tip.hide()
    } catch (error) {
      tip.html(error.message)
      tip.show()
      return
    }

    if (this.opts.value !== parseFloat(input.val())) {
      $(this.id).attr('data-changed', true)
      this.opts.value = input.val()
    }
  },

  validate: function(input) {
    var value = input.val()

    if (!/^\d+$/.test(value)) {
      throw new Error('一定是你填数字的姿势不对！')
    }
    else if (input.data('property') === 'price') {
      var num = parseFloat(input.val())

      if (num > 10000000) {
        throw new Error('天价商品暂不支持！')
      }
      else if (num <= 0) {
        throw new Error('价格要童叟无欺，暂不允许免费甚至倒贴的价格！')
      }
    }
  }
})


module.exports = NumberField
