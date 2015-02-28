(function(global) {
  'use strict';
  var app = global.app || {};
  var m = global.m || require('mithril');

  var Panel = app.Panel;
  var Score = app.Score;

  var noop = function() {};

  var ControlBoardController = function(option) {
    this.color = m.prop(option.color);
    this.active = m.prop(false);
    this.panels = m.prop([]);
    this.selectedIndex = m.prop(-1);
    this.selectedPanel = m.prop(null);
    this.score = m.prop(new Score());
    this.panelWidth = m.prop(72);
    this.onok = noop;
    this.onback = noop;
  };

  ControlBoardController.prototype.supplyPanel = function() {
    var panels = this.panels();
    for (var pi = 0; pi < 3; pi++) {
      var panel = panels[pi];
      if (!panel)
        panels[pi] = Panel.sample(this.color());
    }
  };

  ControlBoardController.prototype.dispatchEvent = function(event) {
    if (!this.active())
      return;
    switch (event.type) {
    case 'ok':
      if (this.selectedIndex() !== -1)
        this.onok();
      break;
    case 'back':
      var selectedPanel = this.selectedPanel();
      this.selectedIndex(-1);
      this.selectedPanel(null);
      if (selectedPanel)
        this.onback(selectedPanel);
      break;
    case 'select':
      var index = event.index;
      if (this.selectedIndex() === -1) {
        this.selectedIndex(index);
        this.selectedPanel(this.panels()[index]);
      }
      break;
    default:
      break;
    }
  };

  app.ControlBoardController = ControlBoardController;
  global.app = app;
}(this));