(function(global) {
  'use strict';
  var app = global.app || {};
  var m = global.m;

  var Panel = app.Panel;
  var Score = app.Score;

  var ControlBoardController = function(option) {
    var noop = function() {};
    this.color = m.prop(option.color);
    this.active = m.prop(false);
    this.panels = m.prop([null, null, null]);
    this.selectedPanel = m.prop(null);
    this.score = m.prop(new Score({red: 0, yellow: 0, green: 0}));
    this.panelWidth = m.prop(72);
    this.onok = noop;
    this.onback = noop;
    this.onselect = noop;
  };

  ControlBoardController.prototype.supplyPanel = function() {
    var color = this.color();
    var panels = this.panels();
    for (var pi = 0, plen = panels.length; pi < plen; pi++) {
      if (!panels[pi])
        panels[pi] = Panel.sample(color);
    }
  };

  ControlBoardController.prototype.selectedIndex = function() {
    var panels = this.panels();
    var selectedPanel = this.selectedPanel();
    for (var pi = 0, plen = panels.length; pi < plen; pi++) {
      if (panels[pi] === selectedPanel)
        return pi;
    }
    return -1;
  };

  ControlBoardController.prototype.removeSelectedPanel = function() {
    this.panels()[this.selectedIndex()] = null;
    this.selectedPanel(null);
  };

  ControlBoardController.prototype.addScore = function(color, value) {
    this.score().add(color, value);
  };

  ControlBoardController.prototype.resetScore = function() {
    this.score().reset();
  };

  ControlBoardController.prototype.totalScore = function() {
    return this.score().total();
  };

  ControlBoardController.prototype.dispatchEvent = function(event) {
    var active = this.active();
    var panels = this.panels();
    var selectedPanel = this.selectedPanel();

    if (!active)
      return;

    switch (event.type) {
    case 'ok':
      if (!selectedPanel)
        break;
      this.onok();
      break;
    case 'back':
      if (!selectedPanel)
        break;
      selectedPanel.resetRotation();
      this.selectedPanel(null);
      this.onback();
      break;
    case 'select':
      if (selectedPanel)
        break;
      var panel = panels[event.selectedIndex];
      this.selectedPanel(panel);
      m.redraw(true);
      this.onselect({panel: panel});
      break;
    default:
      break;
    }
  };

  app.ControlBoardController = ControlBoardController;
  global.app = app;
}(this));