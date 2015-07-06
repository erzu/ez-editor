
var extend = require('extend-object')
var heredoc = require('heredoc')
var Crox = require('crox')


var n = 0

function HiddenField(p, obj) {
  this.property = p
  this.opts = obj
  this.id = '#j-editor-hidden-field' + n++
}

extend(HiddenField.prototype, {
  render: function() {
    return Crox.render(heredoc(function(oneline) {/*
      <div id="{{root.id}}" class="field hidden" data-property="{{root.property}}">
        <input type="hidden" value="{{root.value}}">
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
