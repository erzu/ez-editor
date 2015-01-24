

module.exports = {
  data: {
    "clickurl": "http://www.taobao.com",
    "discount": 4,
    "title": "八个字内图要好看",
    "logo": "http://gtms03.alicdn.com/tps/i3/T13AuDFJBcXXXfyLTi-174-69.jpg",
    "banner": "http://gtms01.alicdn.com/tps/i1/T1gj03FKJbXXbalwkF-330-240.png",
    "items": [
      {
        "image": "http://gi1.md.alicdn.com/bao/uploaded/i1/T19d7vFCtcXXXXXXXX_!!0-item_pic.jpg_200x200.jpg",
        "title": "Burberry"
      },
      {
        "image": "http://gi3.md.alicdn.com/imgextra/i3/2037040441/T2m0kRXsdaXXXXXXXX_!!2037040441.jpg_200x200.jpg",
        "title": "Burberry"
      }
    ]
  },
  metadata: {
    "columns": {
      "clickurl": { "type": "url" },
      "discount": { "maxLength": 1, "type": "number" },
      "title": { "maxLength": 8, "type": "text" },
      "logo": { "height": 60, "width": 110, "type": "image" },
      "banner": { "height": 240, "width": 330, "type": "image" },
      "items": {
        "type": "array",
        "length": 2,
        "columns": {
          "image": { "type": "image", "width": 200, "height": 200 },
          "title": { "type": "text" }
        }
      }
    }
  }
}
