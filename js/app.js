(function(global) {
  'use strict';
  var app = global.app || {};
  var m = global.m || require('mithril');

  var Panel = app.Panel;

  var ActionTileController = app.ActionTileController;
  var ControlBoardController = app.ControlBoardController;
  var TurnController = app.TurnController;

  var panelView = app.panelView;
  var actionTileView = app.actionTileView;
  var controlBoardView = app.controlBoardView;

  app.controller = function() {
    this.actionTileController = new ActionTileController();

    this.whiteControlBoardController = new ControlBoardController({
      color: Panel.COLOR_WHITE
    });

    this.blackControlBoardController = new ControlBoardController({
      color: Panel.COLOR_BLACK
    });

    new TurnController({
      turnPlayerColor: Panel.COLOR_WHITE,
      actionTileController: this.actionTileController,
      whiteControlBoardController: this.whiteControlBoardController,
      blackControlBoardController: this.blackControlBoardController
    }).start();
  };

  app.view = function(ctrl) {
    return m('svg.stage.unselectable', {viewBox: '-360,-360,720,720'}, [
      actionTileView(ctrl.actionTileController),
      controlBoardView(ctrl.whiteControlBoardController),
      controlBoardView(ctrl.blackControlBoardController)
    ]);
  };

  app.supportsTouch = 'createTouch' in global.document;

  app.supportsTransitionEnd = (function() {
    var div = document.createElement('div');
    return typeof div.style['transition'] !== 'undefined';
  }());

  app.globalToLocal = function(gpt) {
    var stageElement = document.querySelector('.stage');
    var lpt = stageElement.createSVGPoint();
    lpt.x = gpt.x;
    lpt.y = gpt.y;
    return lpt.matrixTransform(stageElement.getScreenCTM().inverse());
  };

  app.createPanelView = function(option) {
    return panelView({
      panel: m.prop(option.panel),
      x: m.prop(option.x),
      y: m.prop(option.y),
      width: m.prop(option.width)
    });
  };

  m.module(document.getElementById('container'), app);
  global.app = app;
})(this);