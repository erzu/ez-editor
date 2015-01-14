var _ = require('@ali/belt')
var heredoc = require('heredoc')
var Crox = require('crox')


function Model(p, opts) {
  this.property = typeof p !== 'undefined' ? p : 'root'
  this.columns = []
  this.opts = opts
}

_.extend(Model.prototype, {
  render: function() {
    return Crox.render(heredoc(function(oneline) {/*
      <div class="dib model frame" data-property="{{ root.property }}">
        {{{ root.columns }}}
      </div>
    */}), {
      columns: this.columns.map(function(column) {
        return column.render()
      }).join(''),
      property: this.property
    })
  },

  bind: function() {
    this.columns.forEach(function(column) {
      column.bind()
    })
  },

  queryPath: function(path) {
    return path.reduce(function(model, p) {
      if (!model) return

      if (/editor-mixed/.test(model.id)) {
        model = model.columns[model.selected]
      }

      var columns = model.models || model.columns

      for (var i = 0; i < columns.length; i++) {
        var column = columns[i]

        if (column.property === p) return column
      }
    }, this)
  }
})


module.exports = Model
