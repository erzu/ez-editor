

var Field = require('./field')
var heredoc = require('heredoc')
var Crox = require('crox')
var _ = require('@ali/belt')
var $ = require('@ali/yen')
require('@ali/yen/events')


var n = 0

function VideoField(p, opts) {
  this.id = '#j-editor-video-filed' + n++
  this.property = p
  this.opts = opts
  this.page = 1

  this.opts.ugc = /x.chuangyi.taobao.com/.test(location.href) ?
    'http://ugc.taobao.com' :
    'http://ugc.daily.taobao.net'
}


_.inherits(VideoField, Field)

_.extend(VideoField.prototype, {
  template: heredoc(function(oneline) {/*
    <div id="{{ root.id }}" class="video-editor field" data-type="{{ root.type }}" data-property="{{ root.property }}">
      <input type="hidden" value="{{ root.value }}">
      <p class="info">
        <span class="prompt">以下是你已上传的视频，请选择：</span>
        <span class="empty hidden">没找到符合条件的视频，</span>
        <a href="{{ root.ugc }}" target="_blank"><i class="iconfont icon-add"></i> 上传视频</a>
      </p>
      <ul class="tiles dib-box justify videos"></ul>
      <div class="paginator hidden"></div>
    </div>
  */}),

  bind: function() {
    var el = $(this.id)

    el.find('.videos').on('click', this.select.bind(this))
    el.find('.paginator').on('click', this.willPaginate.bind(this))

    this.paginate()
  },

  paginate: function() {
    if (this.page < 1)
      this.page = 1
    else if (this.page > this.pages)
      this.page = this.pages

    jQuery.ajax({
      url: '/videos?page=' + this.page,
      dataType: 'json',
      success: this.renderVideos.bind(this)
    })
  },

  willPaginate: function(e) {
    var target = $(e.target)

    if (target.hasClass('disabled')) return

    if (target.hasClass('previous')) {
      this.page -= 1
      this.paginate()
    }
    else if (target.hasClass('next')) {
      this.page += 1
      this.paginate()
    }
  },

  renderVideos: function(result) {
    var videoTemplate = heredoc(function(oneline) {/*
      {{#each root.resultList 'video'}}
      <li class="tile dib video" data-url="{{ video.videoPlayInfo.androidPhoneV23Url.ld }}">
        <div class="tile-body">
          <div class="center-box cover">
            <b class="center-hack"></b>
            <div class="center-body"><img src="{{ video.coverUrl }}_m.jpg"></div>
          </div>
          <a class="video-play" target="_blank" href="{{ video.videoPlayInfo.flashUrl }}">
            <i class="iconfont icon-play"></i>
          </a>
          <div class="label">{{ video.title }}</div>
        </div>
      </li>
      {{/each}}
    */})
    var pageTemplate = heredoc(function(oneline) {/*
      <span class="previous {{#if root.page <= 1}}disabled{{/if}}">上一页</span>
      <span>{{ root.page }}</span> / <span>{{ root.pages }}</span>
      <span class="next {{#if root.page >= root.pages}}disabled{{/if}}">下一页</span>
    */})

    var el = $(this.id)

    if (result.totalNum <= 0) {
      return this.empty()
    }

    el.find('.videos').html(Crox.render(videoTemplate, result))
    el.find('[data-url="' + this.opts.value + '"]').addClass('selected')
    el.find('.cover').each(this.bindImage.bind(this))

    if (result.pages > 1) {
      this.pages = result.pages
      el.find('.paginator')
        .html(Crox.render(pageTemplate, result))
        .removeClass('hidden')
    }
  },

  empty: function() {
    var el = $(this.id)

    el.find('.videos').hide()
    el.find('.prompt').hide()
    el.find('.empty').removeClass('hidden')

    var editor = $('#editor')

    editor.trigger({
      type: 'video:insufficientData',
      target: editor
    })
  },

  bindImage: function(cover) {
    $(cover).find('img').on('load', this.checkHeight)
  },

  checkHeight: function(e) {
    var img = $(e.target)
    var cover = img.parent('.cover')
    var boxHeight = cover.height()
    var imgHeight = img.innerHeight()

    if (imgHeight > boxHeight) {
      img.css('margin-top', (boxHeight - imgHeight) / 2 + 'px')
    }
  },

  select: function(e) {
    var target = $(e.target)

    target = target.hasClass('video') ? target : target.parent('.video')

    if (target) {
      $(this.id).find('.video').removeClass('selected')
      target.addClass('selected')
      $(this.id).find('input')
        .attr('data-changed', true)
        .val(target.data('url'))
    }
  }
})


module.exports = VideoField

