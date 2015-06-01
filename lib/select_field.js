var Field = require('./field')
var _ = require('@ali/belt')
var $ = require('@ali/yen')
var heredoc = require('heredoc')


var n = 0

function SelectField(p, obj) {
  this.id = '#j-editor-link-field-' + n++
  this.opts = obj
  this.property = p
}

_.inherits(SelectField, Field)

_.extend(SelectField.prototype, {
  template: heredoc(function(oneline) {/*
    <div id="{{ root.id }}" class="field select-field" data-type="{{ root.type }}" data-property="{{ root.property }}">
      <p class="field-label"> {{ root.label }}</p>
      <input class="field-block hidden" disabled type="text" data-value="{{ root.value }}" value="{{ root.options[root.value] }}">
      <p class="field-input"> {{ root.options[root.value] }}</p>
      <ul class="select-dropdown">
      {{#forin root.options option label}}
        <li class="select-dropdown-item" data-value={{ label }}> {{ option }} </li>
      {{/forin}}
      </ul>
    </div>
  */}),
  bind: function() {
    $(this.id).find('.field-input').on('click', this.triggerDropdown.bind(this))
    $(this.id).find('.select-dropdown-item').on('click', this.changeValue.bind(this))
  },
  triggerDropdown: function() {
    var $e = $(this.id)
    var body = $(document.body), self = this, dropdown
    var handler = function() {
      self.triggerDropdown();
      $(document).off('click', handler)
    }
    $e.toggleClass('open')
    if ($e.hasClass('open')) {
      dropdown = $e.find('.select-dropdown')
      var input = $e.find('.field-input')
      var offset = input.offset()
      offset.top += input.height()
      dropdown.css(offset).css('width', input.width()).remove().appendTo(body)
      setTimeout(function() {
        $(document).on('click', handler)
      }.bind(this), 100)
    } else {
      dropdown = body.children('.select-dropdown')
      dropdown.remove().appendTo($e)
    }
  },
  changeValue: function(e) {
    var target = $(e.target), ele = $(this.id)
    this.value = target.data('value')
    var label = this.opts.options[this.value]
    ele.find('.select-dropdown').toggleClass('show')
    ele.find('.field-input').html(label)
    ele.find('.field-block').data('value', this.value).attr('value', label).data('changed', 'true')
  }
})


module.exports = SelectField
