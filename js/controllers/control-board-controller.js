(function(global) {
  'use strict';
  var m = global.m;
  var panelis = global.panelis;
  var app = global.app || {};

  var noop = function() {};

  var controller = function(option) {
    this.color = m.prop(option.color || panelis.Panel.COLOR_WHITE);
    this.active = m.prop(option.active || false);
    this.panels = option.panels || [null, null, null];
    this.selectedIndex = m.prop(-1);
    this.selectedPanel = option.selectedPanel || m.prop(null);
    this.onok = option.onok || noop;
    this.onback = option.onback || noop;
    this.score = option.score || new app.Score();
  };

  controller.prototype.supplyPanel = function() {
    var panels = this.panels;
    for (var pi = 0; pi < 3; pi++) {
      var panel = panels[pi];
      if (!panel)
        panels[pi] = panelis.Panel.sample(this.color());
    }
  };

  controller.prototype.calcScore = function() {
    var score = this.score;
    return score.red() * 100 + score.yellow() * 50 + score.green() * 300;
  };

  controller.prototype.dispatchEvent = function(event) {
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
      this.onback(selectedPanel);
      break;
    case 'select':
      var index = event.index;
      if (this.selectedIndex() === -1) {
        this.selectedIndex(index);
        this.selectedPanel(this.panels[index]);
      }
      break;
    default:
      break;
    }
  };

  app.ControlBoardController = controller;

  global.app = app;
}(this));