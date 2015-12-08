

var extend = require('extend-object')
var inherits = require('inherits')
var $ = require('yen')
var heredoc = require('heredoc')

var Uploader = require('../arale/upload').Uploader
var Field = require('./field')


var n = 0

function ImageField(p, opts) {
  this.id = '#j-editor-image-field-' + n++
  this.property = p
  this.opts = extend({ label: '图片' }, opts)
}


inherits(ImageField, Field)

extend(ImageField.prototype, {
  template: heredoc(function(oneline) {/*
    <div id="{{ root.id }}" class="field image-field" data-type="{{ root.type }}" data-property="{{ root.property }}">
      <p class="field-label">{{ root.label }}</p>
      <input type="hidden" {{#if root.value.value}}data-json="true" value="{{ JSON.stringify(root.value) }}"{{else}}value="{{ root.value }}"{{/if}}>
      <div class="content-wrapper">
        <div class="image-editor">
          <div class="thumbnail">
            <img src="{{ root.value.value || root.value }}" width="50" />
          </div>
          <div class="dropbox">
            {{#if root.hideable}}<span class="hideable"><input class="btn-hideable" type="checkbox" {{#if !root.hidden}}checked{{/if}}></span>{{/if}}
            <span class="size">{{ root.width }}x{{ root.height }}</span>
            <span class="btn-image">替换图片</span>
          </div>
        </div>
        <div class="progress"></div>
        <p class="error"></p>
      </div>
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

    $(this.id).find('.btn-hideable').on('change', this.visibilityChange.bind(this))

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
    if (typeof result === 'string') {
      result = JSON.parse(result.replace(/^<pre>/i, '').replace(/<\/pre>$/i, ''))
    }

    $(this.id).find('.error').hide().html('')

    this.editor().trigger('image:didCreate', {
      target: this,
      result: result
    })
  },

  visibilityChange: function(e) {
    var input = $(this.id).find('input').first()
    var value

    if (input.hasAttr('data-json')) {
      value = JSON.parse(input.val())
      value.hidden = !e.currentTarget.checked
      input.val(JSON.stringify(value))
    }
    else {
      input.attr('data-json', 'true')
      value = input.val()
      input.val(JSON.stringify({
        value: value,
        hidden: !e.currentTarget.checked
      }))
    }

    input.attr('data-changed', true)
  },

  change: function(value) {
    var el = $(this.id)
    var thumbnail = el.find('.thumbnail img')
    var input = el.find('input').first()

    var temp
    if (input.hasAttr('data-json')) {
      temp = JSON.parse(input.val())
      temp.value = value
      input.val(JSON.stringify(temp))
    }
    else {
      input.val(value)
    }

    input.attr('data-changed', true)
    thumbnail.attr('src', value)
    this.editor().trigger('image:load', { el: el })
  },

  progress: function(event, position, total, percent) {
    $(this.id).find('.progress').html(percent + '% uploaded!')
  }
})


module.exports = ImageField
