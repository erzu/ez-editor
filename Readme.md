# ez-editor


## Usage

```js
var Editor = require('ez-editor')

new Editor('#editor', {
  data: {
    "image": "http://gtms04.alicdn.com/tps/i4/TB1bLlsGFXXXXaDaXXX_zU1YXXX-740-740.jpg",
    "logo": "http://gtms02.alicdn.com/tps/i2/TB1R6U4GpXXXXcBXVXXjVgIJpXX-90-45.png",
    "keyword": "关键词",
    "title": "2014新品必备百搭款",
    "clickurl": "http://www.taobao.com"
  },
  metadata: {
    "columns": {
      "image": {"type": "image", "width": 740, "height": 740},
      "logo": {"type": "image", "width": 96, "height": 48},
      "title": {"type": "text", "maxLength": 3},
      "subtitle": {"type": "text", "maxLength": 14},
      "clickurl": {"type": "url"}
    }
  }
})

  .set('image:create', '/graphics/images')
  .on('image:didCreate', function(e) {
    var field = e.target
    var result = e.result

    field.change(result.files[0].path)
  })

  .end()
```


### Register Type

可以使用 `.registerType` 方法，扩展 `metadata` 里头的字段类型

```js
var Editor = require('ez-editor')
var Field = Editor.Field


var VideoFieldCounter = 0

function VideoField(p, opts) {
  this.id = '#j-editor-video-field' + VideoFieldCounter++
  this.property = p
  this.opts = _.extend({
    formats: ['flv'],
    rate: 240
  }, opts)

  this.page = 1
}

_.inherits(VideoField, Field)

_.extend(VideoField.prototype, {
  // ...
})


new Editor('#editor', { ... })
  .registerType('video', VideoField)
  .end()
```


### Field 与 CustomField

TODO


## Development

```js
$ tnpm start
$ open http://localhost:5000/test/dryrun.html
```

### 注册字段类型

在具体场景中，我们可以通过 `.registerType` 来注册字段类型：

```js
new Editor('#editor', { ... })
  .registerType('video', DiamondVideoField)
  .end()
```

详见 `.registerType` 相关文档，自定义的字段 Class 写法详见 `Field` 相关文档。


### 数据变动事件

在 `ez-editor` 里， 编辑器只消化传进来的 `data` 和 `metadata`，数据有变更时，通过
`change` 事件抛出：

```js
var stage = require('creative-show')('#creative', creative).end()

new Editor('#el', { ... })
  .on('editor:change', function(e) {
    stage
      .set('data', e.data)
      .end()
  })
  .end()
```

### 数据提取

保存时可以调用 `Editor#dump` 获取编辑器数据

```js
var editor = new Editor('#el', { ... })
  .on('editor:change', function(e) {
    console.log(e.data)
  })
  .end(function() {
    $('.j-save').on('click', function() {
      jQuery.ajax({
        url: '/creations',
        data: JSON.stringify({ data: editor.dump() })
      })
    })
  })
```

