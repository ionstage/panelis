(function(global) {
  'use strict';
  var app = global.app || {};
  var m = global.m || require('mithril');

  var TileController = function(option) {
    this.panels = m.prop(option.panels || null);
    this.panelWidth = m.prop(option.panelWidth || 72);
    this.rowLength = m.prop(option.rowLength || 8);
    this.colLength = m.prop(option.colLength || 8);
  };

  app.TileController = TileController;
  global.app = app;
}(this));