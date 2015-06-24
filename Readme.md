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

  // ImageField 中上传图片所用的接口
  .set('image:create', '/graphics/images')
  .on('image:didCreate', function(e) {
    var field = e.target
    var result = e.result

    // `/graphics/images` 接口返回的结果。在创意中心里，这个接口返回的结果格式类似：
    //
    //     {
    //       files: [
    //         { id: 784533, path: 'http://...', width: 200, height: 200 }
    //       ]
    //     }
    //
    field.change(result.files[0].path)
  })

  .end()
```


### Register Type

可以使用 `.registerType` 方法，扩展 `metadata` 里头的字段类型，方便处理类似：

- 1688Shop
- clip
- diamondShop
- diamondShopType
- diamondVideo
- video

之类的特殊字段：

```js
var Editor = require('ez-editor')
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


### Field 与 CustomField

TODO


## Development

```js
$ tnpm start
$ open http://localhost:5000/tets/runner.html
```


## 与 `ma/saka/edit` 的区别

新接入的用户不需要关心以下文档，只是迁移过程的记录。


### 没有 `diamondShop` 等业务定制字段

相比 `ma/saka/edit`，`ez-editor` 里不支持如下字段：

| type            | Class                |
|-----------------|----------------------|
| 1688Shop        | _1688ShopField       |
| clip            | ClipField            |
| diamondShop     | DiamondShopField     |
| diamondShopType | DiamondShopTypeField |
| diamondVideo    | DiamondVideoField    |
| video           | VideoField           |

因为都是与具体业务，与所接入的平台强相关的，所以在 `ez-editor` 模块中默认不支持这些字段。
相应的，在具体场景中，我们可以通过 `.registerType` 来注册字段类型：

```js
new Editor('#editor', { ... })
  .registerType('video', DiamondVideoField)
  .end()
```

详见 `.registerType` 相关文档，自定义的字段 Class 写法详见 `Field` 相关文档。


### 不处理预览区域

在 `ma/saka/edit` 里，直接支持了 `ma/saka/show` 构建出来的实例。定制面板中的数据有变更
的时候，会自行刷新预览区域。

在 `ez-editor` 里， 不再耦合这层逻辑，编辑器只消化传进来的 `data` 和 `metadata`，
数据有变更时，通过 `change` 事件抛出：

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

`ez-editor` 也不再持有 `stage`，而是仅处理 `stage.data` 和 `stage.metadata`。


### 不处理数据保存

在 `ma/saka/edit` 里，用户点击右侧面板底部的保存按钮的时候，会直接向配置的后端接口提交数据。

在 `ez-editor` 里，不再耦合这层逻辑，编辑器也不再监听 `$('.j-save')` 的点击时间，需要
在使用的时候自行调用 `Editor#dump`

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

