(function(global) {
  'use strict';
  var app = global.app || {};
  var m = global.m || require('mithril');

  var Panel = app.Panel || require('./panel.js').app.Panel;

  var Slot = function(panels, color) {
    this.panels = panels;
    this.color = m.prop(color || Panel.COLOR_BROWN);
    this.selectedIndex = m.prop(-1);
  };

  Slot.prototype.panel = function(index, panel) {
    if (typeof panel === 'undefined')
      return this.panels[index];

    this.panels[index] = panel;
  };

  Slot.prototype.supply = function() {
    var panels = this.panels;
    for (var pi = 0, plen = panels.length; pi < plen; pi++) {
      var panel = panels[pi];
      if (!panel)
        panels[pi] = Panel.sample(this.color());
    }
  };

  app.Slot = Slot;
  global.app = app;
}(this));