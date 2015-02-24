(function(global) {
  'use strict';
  var app = global.app || {};
  var m = global.m || require('mithril');

  var PanelController = function(option) {
    this.panel = m.prop(option.panel || null);
    this.x = m.prop(option.x || 0);
    this.y = m.prop(option.y || 0);
    this.width = m.prop(option.width || 72);
  };

  app.PanelController = PanelController;
  global.app = app;
}(this));