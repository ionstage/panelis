(function(global) {
  'use strict';
  var app = global.app || {};
  var m = global.m || require('mithril');

  var TileController = app.TileController;

  var ActionTileController = function() {
    TileController.call(this);
    this.selectedPanel = m.prop(null);
    this.selectedPosition = m.prop(null);
  };

  ActionTileController.prototype = Object.create(TileController.prototype);
  ActionTileController.prototype.constructor = ActionTileController;

  ActionTileController.prototype.dispatchEvent = function(event) {
    var tile = this.tile();
    var selectedPanel = this.selectedPanel();
    var selectedPosition = this.selectedPosition();

    switch (event.type) {
    case 'select':
      if (selectedPanel && !selectedPosition) {
        var row = event.row;
        var col = event.col;
        if (tile.panel(row, col))
          break;
        this.selectedPosition({
          row: row,
          col: col
        });
        m.redraw(true);
      }
      break;
    case 'rotationend':
      if (selectedPanel) {
        selectedPanel.rotate();
        m.redraw(true);
      }
      break;
    default:
      break;
    }
  };

  app.ActionTileController = ActionTileController;
  global.app = app;
}(this));