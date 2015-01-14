

var Field = require('./field')
var _ = require('@ali/belt')
var $ = require('@ali/yen')
var heredoc = require('heredoc')
var Crox = require('crox')


/* globals jQuery: false */
var n = 0

function ClipField(p, opts) {
  this.id = '#j-editor-clip-field' + n++
  this.property = p
  this.opts = opts
}

_.inherits(ClipField, Field)

_.extend(ClipField.prototype, {
  template: heredoc(function(oneline) {/*
    <div id="{{ root.id }}" class="clip-editor field" data-type="{{ root.type }}" data-property="{{ root.property }}">
      <h4>选择背景音乐</h4>
      <input type="hidden" value="{{ root.value }}">
      <ul class="tiles dib-box justify clips"></ul>
    </div>
  */}),

  bind: function() {
    $(this.id).on('click', this.select.bind(this))

    jQuery.ajax({
      url: '/clips',
      dataType: 'json',
      success: this.renderClips.bind(this)
    })
  },

  renderClips: function(clips) {
    var template = heredoc(function(oneline) {/*
      {{#each root.clips 'clip' }}
      <li class="tile dib clip" data-name="{{ clip.name }}">
        <span class="tile-body" title="{{ clip.label }}">
          <i class="iconfont icon-music"></i>
          <span class="label">{{ clip.label}}</span>
        </span>
      </li>
      {{/each}}
    */})

    clips.forEach(function(clip) {
      clip.name = clip.name.replace(/\.mp3$/, '')
    })

    $(this.id).find('.clips').html(Crox.render(template, { clips: clips }))
    $(this.id)
      .find('[data-name="' + this.opts.value + '"]')
      .addClass('selected')
  },

  select: function(e) {
    var target = $(e.target)

    target = target.hasClass('clip') ? target : target.parent('.clip')

    if (target) {
      $(this.id).find('.clip').removeClass('selected')
      target.addClass('selected')
      $(this.id).find('input')
        .attr('data-changed', true)
        .val(target.data('name'))
    }
  }
})


module.exports = ClipField
