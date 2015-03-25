

var Field = require('./field')
var _ = require('@ali/belt')
var $ = require('@ali/yen')
var heredoc = require('heredoc')
var Uploader = require('../arale/upload').Uploader


var n = 0

function ImageField(p, opts) {
  this.id = '#j-editor-image-field-' + n++
  this.property = p
  this.opts = opts
}


_.inherits(ImageField, Field)

_.extend(ImageField.prototype, {
  template: heredoc(function(oneline) {/*
    <div id="{{ root.id }}" class="field" data-type="{{ root.type }}" data-property="{{ root.property }}">
      <input type="hidden" value="{{ root.value }}">
      <div class="image-editor">
        <div class="thumbnail">
          <img src="{{ root.value }}" width="50" />
        </div>
        <div class="dropbox">
          <span class="size">{{ root.width }}x{{ root.height }}</span>
          <span class="btn-image">替换图片</span>
        </div>
      </div>
      <div class="progress"></div>
      <p class="error"></p>
    </div>
  */}),

  bind: function() {
    new Uploader({
      trigger: this.id + ' .btn-image',
      name: 'images',
      action: '/graphics/images',
      accept: 'image/*',
      container: this.id + ' .dropbox',
      multiple: true,
      data: {
        width: this.opts.width,
        height: this.opts.height
      },
      error: this.uploadError.bind(this),
      success: this.success.bind(this),
      progress: this.progress.bind(this)
    })

    // arale/uploader 自动算出来的定位有错误
    $(this.id).find('.dropbox form').css($(this.id).find('.btn-image').position())

    // Must be deferred to make sure the event won't be missed.
    setTimeout(function() {
      this.editor().trigger('image:load', { el: $(this.id) })
    }.bind(this), 100)
  },

  uploadError: function() {
    var err = $(this.id).find('.error')

    err.html('上传失败了，再来一发！')
    err.show()
  },

  success: function(result) {
    // If running in legacy browsers, the uploader will grab the response via an <iframe>
    // which will cause the result to be wrapped with a pair of `<pre>` tags.
    if (typeof result == 'string') {
      result = JSON.parse(result.replace(/^<pre>/i, '').replace(/<\/pre>$/i, ''))
    }

    $(this.id).find('.error').hide().html('')

    this.editor().trigger('image:didCreate', {
      target: this,
      result: result
    })
  },

  change: function(value) {
    var el = $(this.id)
    var thumbnail = el.find('.thumbnail img')
    var input = el.find('input').first()

    input.attr('data-changed', true)
    input.val(value)
    thumbnail.attr('src', value)
  },

  progress: function(event, position, total, percent) {
    $(this.id).find('.progress').html(percent + '% uploaded!')
  }
})


module.exports = ImageField
