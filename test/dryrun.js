var Editor = require('../index')
var _ = require('@ali/belt')
var $ = require('@ali/yen')

var HiddenField = Editor.HiddenField


var n = 0

function DiamondShopTypeField(p, opts) {
  HiddenField.call(this, p, opts)
  this.id = '#j-editor-diamond-shop-type-field' + n++
}

_.inherits(DiamondShopTypeField, HiddenField)

_.extend(DiamondShopTypeField.prototype, {
  bind: function() {
    // Fetch the actual shop type of current diamond user then pass it on
    // via this DiamondShopTypeField
    setTimeout(function() {
      $(this.id).find('input').val('hitao')
    }.bind(this), 1000)
  }
})


new Editor('#fixture .editor', {
  data: {
    phrases: ['hello', 'world'],
    items: [
      {
        image: 'http://gi1.md.alicdn.com/bao/uploaded/i1/T19d7vFCtcXXXXXXXX_!!0-item_pic.jpg_200x200.jpg',
        title: 'Burberry'
      },
      {
        image: 'http://gi3.md.alicdn.com/imgextra/i3/2037040441/T2m0kRXsdaXXXXXXXX_!!2037040441.jpg_200x200.jpg',
        title: 'Burberry'
      }
    ],
    shopType: 'tmall'
  },
  metadata: {
    columns: {
      phrases: {
        type: 'array',
        length: 2,
        element: { type: 'string' }
      },
      items: {
        type: 'array',
        length: 2,
        columns: {
          image: { type: 'image', width: 200, height: 200 },
          title: { type: 'text' }
        }
      },
      shopType: { type: 'diamondShopType' }
    }
  }
})
  .registerType('diamondShopType', DiamondShopTypeField)
  .end()
