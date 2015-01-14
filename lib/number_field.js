

var Field = require('./field')
var _ = require('@ali/belt')
var heredoc = require('heredoc')


var n = 0

function NumberField(p, opts) {
  this.id = '#j-editor-number-field-' + n++
  this.property = p
  this.opts = opts
}


_.inherits(NumberField, Field)

_.extend(NumberField.prototype, {
  template: heredoc(function(oneline) {/*
    <div id="{{ root.id }}" class="field" data-type="{{ root.type }}" data-property="{{ root.property }}">
      <input class="field-block" type="text" value="{{ root.value }}">
      <p class="error"></p>
    </div>
  */}),

  validate: function(input) {
    var value = input.val()

    if (!/^\d+$/.test(value)) {
      return '一定是你填数字的姿势不对！'
    }
    else if (input.data('property') === 'price') {
      var num = parseFloat(input.val())

      if (num > 10000000) {
        return '这么贵！您忽悠我呢！'
      }
      else if (num <= 0) {
        return '蒙谁呢，这么便宜！'
      }
    }
  }
})


module.exports = NumberField
