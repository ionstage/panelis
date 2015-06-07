(function(app) {
  'use strict';
  var m = require('mithril');
  var util = app.util || require('../util.js');
  var TileController = app.TileController || require('./tile-controller.js');

  var ActionTileController = util.inherits(function() {
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

  if (typeof module !== 'undefined' && module.exports)
    module.exports = ActionTileController;
  else
    app.ActionTileController = ActionTileController;
})(this.app || (this.app = {}));