

var Field = require('./field')

var extend = require('extend-object')
var inherits = require('inherits')
var heredoc = require('heredoc')


var n = 0

function LinkField(p, obj) {
  this.id = '#j-editor-link-field-' + n++
  this.opts = extend({ label: '链接', placeholder: '请填写链接' }, obj)
  this.property = p
}

inherits(LinkField, Field)

extend(LinkField.prototype, {
  template: heredoc(function(oneline) {/*
    <div id="{{ root.id }}" class="field" data-type="{{ root.type }}" data-property="{{ root.property }}">
      <p class="field-label">{{ root.label }}</p>
      <input class="field-block" type="text" value="{{ root.value }}" placeholder="{{ root.placeholder }}">
      <p class="error"></p>
    </div>
  */}),

  validate: function(input) {
    var value = input.val()

    if (!/^https?:\/\//.test(value)) {
      return '一定是你链接格式填的不对哦！'
    }
  }
})


module.exports = LinkField
