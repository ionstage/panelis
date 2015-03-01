(function(global) {
  'use strict';
  var app = global.app || {};
  var m = global.m || require('mithril');

  var inherits = function(ctor, superCtor) {
    ctor.super_ = superCtor;
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    return ctor;
  };

  var TileController = app.TileController;

  var ActionTileController = inherits(function() {
    ActionTileController.super_.call(this);
    this.selectedPanel = m.prop(null);
    this.selectedPosition = m.prop(null);
  }, TileController);

  ActionTileController.prototype.clearSelection = function() {
    this.selectedPanel(null);
    this.selectedPosition(null);
  };

  ActionTileController.prototype.dispatchEvent = function(event) {
    var tile = this.tile();
    var selectedPanel = this.selectedPanel();
    var selectedPosition = this.selectedPosition();

    switch (event.type) {
    case 'select':
      if (!selectedPanel || selectedPosition)
        break;
      var row = event.row;
      var col = event.col;
      if (tile.panel(row, col))
        break;
      this.selectedPosition({
        row: row,
        col: col
      });
      m.redraw(true);
      break;
    case 'rotationend':
      if (!selectedPanel)
        break;
      selectedPanel.rotate();
      m.redraw(true);
      break;
    default:
      break;
    }
  };

  app.ActionTileController = ActionTileController;
  global.app = app;
}(this));