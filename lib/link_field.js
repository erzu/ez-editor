

var Field = require('./field')
var _ = require('@ali/belt')
var heredoc = require('heredoc')


var n = 0

function LinkField(p, obj) {
  this.id = '#j-editor-link-field-' + n++
  this.opts = obj
  this.property = p
}

_.inherits(LinkField, Field)

_.extend(LinkField.prototype, {
  template: heredoc(function(oneline) {/*
    <div id="{{ root.id }}" class="field" data-type="{{ root.type }}" data-property="{{ root.property }}">
      <input class="field-block" type="text" value="{{ root.value }}">
      <p class="error"></p>
    </div>
  */}),

  validate: function(input) {
    var value = input.val()

    if (!/^http:\/\//.test(value)) {
      return '一定是你链接格式填的不对哦！'
    }
  }
})


module.exports = LinkField
