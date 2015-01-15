/* globals expect: false */
'use strict';

var Editor  = require('@ali/editor')
var creative0 = require('./fixture/creative0')
var $ = require('@ali/yen')


describe('@ali/editor', function() {
  var editor

  before(function() {
    editor = new Editor('#fixture', creative0).end()
  })

  it('.dump data', function() {
    expect(editor.dump()).to.be.an(Object)
  })

  it('each field has an .editor method to traverse back to root', function() {
    expect(editor.model.parent).to.equal(editor)
    expect(editor.model.columns[0].editor()).to.equal(editor)
  })

  it('.trigger change event', function(done) {
    editor.on('change', function(e) {
      expect(e.data.clickurl).to.equal('http://cyj.me')
      done()
    })
    var ipt = $(editor.model.columns[0].id).find('input[type=text]')
    ipt.val('http://cyj.me')
    ipt.trigger('keyup')
  })
})
