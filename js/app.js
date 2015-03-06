(function(global) {
  'use strict';
  var app = global.app || {};
  var m = global.m || require('mithril');

  var controller = function() {
    var Panel = app.Panel;

    this.actionTileController = new app.ActionTileController();

    this.whiteControlBoardController = new app.ControlBoardController({
      color: Panel.COLOR_WHITE
    });

    this.blackControlBoardController = new app.ControlBoardController({
      color: Panel.COLOR_BLACK
    });

    new app.TurnController({
      turnPlayerColor: Panel.COLOR_WHITE,
      actionTileController: this.actionTileController,
      whiteControlBoardController: this.whiteControlBoardController,
      blackControlBoardController: this.blackControlBoardController
    }).start();
  };

  var view = function(ctrl) {
    return m('svg.stage.unselectable', {viewBox: '-360,-360,720,720'}, [
      app.actionTileView(ctrl.actionTileController),
      app.controlBoardView(ctrl.whiteControlBoardController),
      app.controlBoardView(ctrl.blackControlBoardController)
    ]);
  };

  m.module(document.getElementById('container'), {
    controller: controller,
    view: view
  });
  global.app = app;
})(this);