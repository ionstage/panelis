(function(global) {
  'use strict';
  var app = global.app || {};
  var m = global.m || require('mithril');

  var ActionTileController = function(option) {
    this.selectedPanel = option.selectedPanel || m.prop(null);
    this.selectedPosition = m.prop(option.selectedPosition || null);
    this.tile = option.tile || null;
    this.rotationCount = m.prop(0);
  };

  ActionTileController.prototype.backRotation = function(_panel) {
    var panel = this.selectedPanel() || _panel;
    if (!panel)
      return;
    var count = 4 - this.rotationCount();
    for (var i = 0; i < count; i++) {
      panel.rotate();
    }
    this.rotationCount(0);
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
        this.rotationCount(0);
        m.redraw(true);
      }
      break;
    case 'rotationend':
      if (this.selectedPanel()) {
        this.selectedPanel().rotate();
        this.rotationCount((this.rotationCount() + 1) % 4);
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