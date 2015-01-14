
var _ = require('@ali/belt')
var heredoc = require('heredoc')


var n = 0

function HiddenField(p, obj) {
  this.property = p
  this.opts = obj
  this.id = '#j-editor-hidden-field' + n++
}

_.extend(HiddenField.prototype, {
  render: function() {
    return _.template(heredoc(function(oneline) {/*
      <div id="{id}" class="field" data-property="{property}">
        <input type="hidden" value="{value}">
      </div>
    */}), {
      id: this.id.slice(1),
      property: this.property,
      value: this.opts.value
    })
  },

  bind: function() {}
})


module.exports = HiddenField
