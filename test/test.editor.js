/* globals expect: false */
var Editor  = require('@ali/editor')
var creative0 = require('./fixture/creative0')
var $ = require('yen')


describe('@ali/editor', function() {
  var editor

  before(function() {
    editor = new Editor('#fixture .editor', creative0)
      .set('interval', 100)
      .end()
  })

  it('.dump data', function() {
    expect(editor.dump()).to.be.an(Object)
  })

  it('each field has an .editor method to traverse back to root', function() {
    expect(editor.model.parent).to.equal(editor)
    expect(editor.model.columns[0].editor()).to.equal(editor)
  })

  it('.trigger change event', function(done) {
    editor.on('editor:change', function onChange(e) {
      expect(e.data).to.be.an(Object)
      expect(e.data.clickurl).to.equal('http://cyj.me')
      editor.off('change', onChange)
      done()
    })
    var ipt = $(editor.model.columns[0].id).find('input[type=text]')
    ipt.val('http://cyj.me')
    ipt.trigger('keyup')
  })

  it('.trigger collection:switch event', function(done) {
    editor.on('collection:switch', function onCollectionSwitch(e) {
      expect(e.path).to.eql(['items', 1])
      editor.off('collection:switch', onCollectionSwitch)
      done()
    })
    var trigger = $(editor.model.columns[5].id).find('.trigger').last()
    trigger.trigger('click')
  })
})
