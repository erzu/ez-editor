var inherits = require('inherits')
var extend = require('extend-object')
var $ = require('yen')
var Crox = require('crox')

var Editor = require('../index')

var HiddenField = Editor.HiddenField


var n = 0

function DiamondShopTypeField(p, opts) {
  HiddenField.call(this, p, opts)
  this.id = '#j-editor-diamond-shop-type-field' + n++
}

inherits(DiamondShopTypeField, HiddenField)

extend(DiamondShopTypeField.prototype, {
  bind: function() {
    // Fetch the actual shop type of current diamond user then pass it on
    // via this DiamondShopTypeField
    setTimeout(function() {
      $(this.id).find('input').val('hitao')
      $(this.id).attr('data-changed', true)
    }.bind(this), 1000)
  }
})


new Editor('#fixture .editor', {
  data: {
    phrases: ['hello', 'world'],
    categories: [
      {
        name: '高端',
        items: [
          { title: '指甲剪' },
          { title: '裁纸刀' }
        ]
      },
      {
        name: '洋气',
        items: [
          { title: '亚洲舞王同款' },
          { title: '北美一哥原味' }
        ]
      }
    ],
    items: [
      {
        image: 'http://gi1.md.alicdn.com/bao/uploaded/i1/T19d7vFCtcXXXXXXXX_!!0-item_pic.jpg_200x200.jpg',
        title: 'Burberry',
        color: '#e67e22'
      },
      {
        image: 'http://gi3.md.alicdn.com/imgextra/i3/2037040441/T2m0kRXsdaXXXXXXXX_!!2037040441.jpg_200x200.jpg',
        title: 'Burberry',
        color: '#e74c3c'
      }
    ],
    shopType: 'tmall',
    color: '#1abc9c',
    source: {
      name: 'itemdsp'
    },
    number: 0
  },
  metadata: {
    columns: {
      phrases: {
        type: 'array',
        length: 2,
        element: { type: 'string' }
      },
      categories: {
        type: 'array',
        length: 2,
        element: {
          type: 'object',
          columns: {
            name: { type: 'string' },
            items: {
              type: 'array',
              length: 2,
              element: {
                type: 'object',
                columns: {
                  title: { type: 'text' }
                }
              }
            }
          }
        }
      },
      items: {
        type: 'array',
        length: 2,
        element: {
          type: 'object',
          columns: {
            image: { type: 'image', width: 200, height: 200, label: '图片'},
            title: { type: 'text'},
            color: { type: 'color', sourceImage: 'image'}
          }
        }
      },
      shopType: { type: 'diamondShopType' },
      color: { type: 'color', palette: ['#f1c40f', '#e67e22', '#e74c3c', '#ecf0f1', '#95a5a6']},
      number: { type: 'number'},
      source: {
        type: 'mixed',
        columns: [{
          type: 'object',
          title: '直通车',
          columns: {
            name: {
              type: 'select',
              options: {
                itemdsp: '单品PC二跳',
                itemjump: '单品无线二跳',
                tcmad: '单品PC一跳',
                mtcmad: '单品无线一跳'
              },
              label: '数据源'
            }
          }
        }, {
          selected: true,
          type: 'hidden',
          title: '网销宝'
        }]
      }
    }
  }
})
  .set('interval', 10)
  .registerType('diamondShopType', DiamondShopTypeField)
  .on('editor:change', function(e) {
    $('#preview pre').html(
      Crox.render('{{root.data}}', { data: JSON.stringify(e.data, null, 2) })
    )
  })
  .end(function() {
    this.trigger('editor:change', { data: this.dump() })
  })
