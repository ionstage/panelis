(function(global) {
  'use strict';
  var app = global.app || {};
  var m = global.m;
  var util = global.util;

  var window = global.window;
  var document = global.document;

  var windowAspectRatio = util.windowAspectRatio;

  app.controller = function() {
    var Panel = app.Panel;
    var ActionTileController = app.ActionTileController;
    var ControlBoardController = app.ControlBoardController;
    var TurnController = app.TurnController;

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
    var actionTileView = app.actionTileView;
    var controlBoardView = app.controlBoardView;

    var className = app.view.className;

    var selector = 'svg.' + className + '.unselectable';
    var attr = {
      viewBox: '-360,-360,720,720',
      config: function(element, isInitialized) {
        if (isInitialized)
          return;

        window.addEventListener('resize', (function() {
          var cache = windowAspectRatio() >= 1.0;
          return function() {
            var isLandscape = windowAspectRatio() >= 1.0;
            if (isLandscape !== cache) {
              m.redraw(true);
              cache = isLandscape;
            }
          };
        })());
      }
    };
    var views = [
      actionTileView(ctrl.actionTileController),
      controlBoardView(ctrl.whiteControlBoardController),
      controlBoardView(ctrl.blackControlBoardController)
    ];
    return m(selector, attr, views);
  };

  app.view.className = 'stage';

  m.module(document.getElementById('container'), app);
  global.app = app;
})(this);