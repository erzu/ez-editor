/* globals expect: false */
'use strict';

var Editor  = require('@ali/editor')
var creative0 = require('./fixture/creative0')


describe('@ali/editor', function() {
  var editor

  before(function() {
    editor = new Editor('#fixture', creative0).end()
  })

  it('.dump data', function() {
    expect(editor.dump()).to.be.an(Object)
  })
})
