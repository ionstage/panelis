(function(app) {
  'use strict';
  var m = require('mithril');
  var util = app.util || require('../util.js');
  var Panel = app.Panel || require('../models/panel.js');
  var Score = app.Score || require('../models/score.js');

  var ControlBoardController = function(option) {
    var noop = function() {};
    this.color = m.prop(option.color);
    this.active = m.prop(false);
    this.panels = panelsProp();
    this.selectedPanel = m.prop(null);
    this.score = m.prop(new Score({red: 0, yellow: 0, green: 0}));
    this.panelWidth = m.prop(72);
    this.onok = noop;
    this.onback = noop;
    this.onselect = noop;
    this.onlayoutchange = noop;
  };

  ControlBoardController.prototype.supplyPanel = function() {
    var color = this.color();
    var panels = this.panels();
    for (var pi = 0, plen = panels.length; pi < plen; pi++) {
      if (!panels[pi]) {
        var panel = Panel.sample(color);
        this.resetRotation(panel);
        panels[pi] = panel;
      }
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

  ControlBoardController.prototype.resetRotation = function(panel) {
    panel.resetRotation();
    if (this.layout() === ControlBoardController.LAYOUT_HORIZONTAL_INVERSE) {
      panel.rotate();
      panel.rotate();
    }
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

  ControlBoardController.prototype.layout = function() {
    if (util.windowAspectRatio() >= 1.0) {
      return ControlBoardController.LAYOUT_VERTICAL;
    } else if (util.supportsTouch() && this.color() === Panel.COLOR_BLACK) {
      return ControlBoardController.LAYOUT_HORIZONTAL_INVERSE;
    } else {
      return ControlBoardController.LAYOUT_HORIZONTAL;
    }
  };

  ControlBoardController.prototype.dispatchEvent = function(event) {
    var active = this.active();
    var panels = this.panels();
    var selectedPanel = this.selectedPanel();

    switch (event.type) {
    case 'ok':
      if (!active || !selectedPanel)
        break;
      this.onok();
      break;
    case 'back':
      if (!active || !selectedPanel)
        break;
      this.resetRotation(selectedPanel);
      this.selectedPanel(null);
      this.onback();
      break;
    case 'select':
      if (!active || selectedPanel)
        break;
      var panel = panels[event.selectedIndex];
      this.selectedPanel(panel);
      m.redraw(true);
      this.onselect({panel: panel});
      break;
    case 'layoutchange':
      for (var pi = 0, plen = panels.length; pi < plen; pi++) {
        var panel = panels[pi];
        if (panel && panel !== selectedPanel)
          this.resetRotation(panel);
      }
      this.onlayoutchange();
      setTimeout(m.redraw, 0);
      break;
    default:
      break;
    }
  };

  ControlBoardController.LAYOUT_VERTICAL = 'vertical';
  ControlBoardController.LAYOUT_HORIZONTAL = 'horizontal';
  ControlBoardController.LAYOUT_HORIZONTAL_INVERSE = 'horizontal_inverse';

  var panelsProp = function() {
    var panels = m.prop([null, null, null]);
    return function(value) {
      if (typeof value === 'undefined')
        return panels();
      for (var vi = 0, vlen = value.length; vi < vlen; vi++) {
        var panel = value[vi];
        if (panel)
          this.resetRotation(panel);
      }
      panels(value);
    };
  };

  if (typeof module !== 'undefined' && module.exports)
    module.exports = ControlBoardController;
  else
    app.ControlBoardController = ControlBoardController;
})(this.app || (this.app = {}));