var extend = require('extend-object')
var inherits = require('inherits')
var $ = require('yen')
var heredoc = require('heredoc')

var Field = require('./field')


var n = 0, globalHandler

function SelectField(p, obj) {
  this.id = '#j-editor-link-field-' + n++
  this.opts = obj
  this.property = p
}

inherits(SelectField, Field)

extend(SelectField.prototype, {
  template: heredoc(function(oneline) {/*
    <div id="{{ root.id }}" class="field select-field" data-type="{{ root.type }}" data-property="{{ root.property }}">
      <p class="field-label">{{ root.label }}</p>
      <input class="field-block hidden" disabled type="text" data-value="{{ root.value }}" value="{{ root.options[root.value] }}">
      <p class="field-input">{{ root.options[root.value] }}</p>
      <span class="triangle"></span>
      <ul class="select-dropdown">
      {{#forin root.options option label}}
        <li class="select-dropdown-item" data-value={{ label }}>{{ option }}</li>
      {{/forin}}
      </ul>
    </div>
  */}),

  bind: function() {
    $(this.id).find('.field-input').on('click', this.triggerDropdown.bind(this))
    $(this.id).find('.select-dropdown-item').on('click', this.changeValue.bind(this))
    this.sync()
  },

  sync: function() {
    var $e = $(this.id)
    var dropdown = $e.find('.select-dropdown')
    var input = $e.find('.field-input')
    var body = $(document.body)

    dropdown.css('width', input.width()).remove().appendTo(body)
    this.dropdown = dropdown
    if (!globalHandler) globalHandler = this.triggerDropdown.bind(this)
  },

  triggerDropdown: function() {
    var $e = $(this.id)

    if (!$e.hasClass('open')) {
      var input = $e.find('.field-input')
      var offset = input.offset()

      offset.top += input.height() + this.dropdown.height()
      this.dropdown.css(offset)
      requestAnimationFrame(function() {
        $(document).on('click', globalHandler)
      })
    } else {
      $(document).off('click', globalHandler)
    }

    $e.toggleClass('open')
    this.dropdown.toggleClass('show')
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
