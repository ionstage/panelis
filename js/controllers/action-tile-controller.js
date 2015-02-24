(function(global) {
  'use strict';
  var app = global.app || {};
  var m = global.m || require('mithril');

  var ActionTileController = function(option) {
    this.tile = m.prop(option.tile || null);
    this.selectedPanel = option.selectedPanel || m.prop(null);
    this.selectedPosition = m.prop(option.selectedPosition || null);
    this.panelWidth = m.prop(option.panelWidth || 72);
    this.rowLength = m.prop(option.rowLength || 8);
    this.colLength = m.prop(option.colLength || 8);
  };

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