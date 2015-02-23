(function(global) {
  'use strict';
  var app = global.app || {};
  var m = global.m || require('mithril');

  var ActionTileController = function(option) {
    this.selectedPanel = option.selectedPanel || m.prop(null);
    this.selectedPosition = m.prop(option.selectedPosition || null);
    this.tile = option.tile || null;
    this.panelWidth = m.prop(option.panelWidth || 72);
    this.rowLength = m.prop(option.rowLength || 8);
    this.colLength = m.prop(option.colLength || 8);
  };

  ActionTileController.prototype.canJointAnyPosition = function(panels) {
    for (var pi = 0, plen = panels.length; pi < plen; pi++) {
      var panel = panels[pi];
      if (panel && this.tile.canJointAnyPosition(panel))
        return true;
    }
    return false;
  };

  ActionTileController.prototype.dispatchEvent = function(event) {
    switch (event.type) {
    case 'select':
      if (this.selectedPanel() && !this.selectedPosition()) {
        var row = event.row;
        var col = event.col;
        if (this.tile.panel(row, col))
          break;
        this.selectedPosition({
          row: row,
          col: col
        });
        m.redraw(true);
      }
      break;
    case 'rotationend':
      if (this.selectedPanel()) {
        this.selectedPanel().rotate();
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