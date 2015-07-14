var extend = require('extend-object')
var heredoc = require('heredoc')
var Crox = require('crox')


function Model(p, opts) {
  this.property = typeof p !== 'undefined' ? p : 'root'
  this.columns = []
  this.opts = opts
}

extend(Model.prototype, {
  render: function() {
    return Crox.render(heredoc(function(oneline) {/*
      <div class="model" data-property="{{ root.property }}">
      {{#forin root.columns 'column'}}
        {{{ column.render() }}}
      {{/forin}}
      </div>
    */}), {
      columns: this.columns,
      property: this.property
    })
  },

  bind: function() {
    this.columns.forEach(function(column) {
      column.bind()
    })
  },

  sync: function() {
    this.columns.forEach(function(column) {
      if (column.sync) column.sync()
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
