# @ali/editor

## Usage

```js
var Editor = require('@ali/editor')

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
  .on('warning', function(e) {
    console.log(e.message)
  })
  .on('submit', function(e) {
    console.log(e.data)
  })
  .end()
```

### Register Type

可以使用 `.registerType` 方法，扩展 `metadata` 里头的字段类型，方便处理类似：

- diamondShop
- diamondShopType
- diamondVideo
- 1688Shop

之类的特殊字段：

```js
var Editor = require('@ali/editor')
var Field = Editor.Field


var diamondVideoFieldCounter = 0

function DiamondVideoField(p, opts) {
  this.id = '#j-editor-diamond-video-field' + diamondVideoFieldCounter++
  this.property = p
  this.opts = _.extend({
    formats: ['flv'],
    rate: 240
  }, opts)

  this.page = 1
}

_.inherits(DiamondVideoField, Field)

_.extend(DiamondVideoField.prototype, {
  // ...
})


new Editor('#editor', { ... })
  .registerType('diamondVideo', DiamondVideoField)
  .end()
```

## Development

```js
$ tnpm start
$ open http://localhost:5000/tets/runner.html
```

## 与 `ma/saka/edit` 的区别

### 没有 `diamondShop` 等业务定制字段

详见 `.registerType` 相关文档。

### 没有 `ma/saka/bugle`

即没有依赖特定的消息反馈模块，改为通过事件抛出，可以自行监听相关事件：

```js
new Editor('#el', { ... })
  .on('warning', function(e) {
    alert(e.message)
  })
  .on('fatal', function(e) {
    alert(e.message + '!!!')
  })
```

### 不处理预览区域

在 `ma/saka/edit` 里，直接支持了 `ma/saka/show` 构建出来的实例。定制面板中的数据有变更
的时候，会自行刷新预览区域。

在 `@ali/editor` 里， 不再耦合这层逻辑，编辑器只消化传进来的 `data` 和 `metadata`，
数据有变更时，通过 `change` 事件抛出：

```js
var stage = require('@ali/show')('#creative', creative).end()

new Editor('#el', { ... })
  .on('change', function(e) {
    stage
      .set('data', e.data)
      .end()
  })
  .end()
```

### 不处理数据保存

在 `ma/saka/edit` 里，用户点击右侧面板底部的保存按钮的时候，会直接向配置的后端接口提交数据。

在 `@ali/editor` 里，不再耦合这层逻辑，编辑器只在保存的时候简单校验数据，校验通过即抛出
`submit` 事件：

```
new Editor('#el', { ... })
  .on('submit', function(e) {
    jQuery.ajax({
      url: 'http://',
      data: e.data,
      dataType: 'json',
      success: function() {}
    })
  })
  .end()
```
