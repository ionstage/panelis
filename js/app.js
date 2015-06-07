(function(app) {
  'use strict';
  var m = require('mithril');
  var util = app.util || require('./util.js');
  var Panel = app.Panel || require('./models/panel.js');
  var ActionTileController = app.ActionTileController || require('./controllers/action-tile-controller.js');
  var ControlBoardController = app.ControlBoardController || require('./controllers/control-board-controller.js');
  var TurnController = app.TurnController || require('./controllers/turn-controller.js');
  var panelView = app.panelView || require('./views/panel-view.js');
  var actionTileView = app.actionTileView || require('./views/action-tile-view.js');
  var controlBoardView = app.controlBoardView || require('./views/control-board-view.js');

  app.stageElement = m.prop(null);

  app.globalToLocal = function(gpt) {
    var stageElement = app.stageElement();
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

  var controller = function() {
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

  var view = function(ctrl) {
    var selector = 'svg.stage.unselectable';
    var attr = {
      viewBox: '-360,-360,720,720',
      config: function(element, isInitialized) {
        if (isInitialized)
          return;

        app.stageElement(element);
        util.addResizeEvent((function() {
          var cache = util.windowAspectRatio() >= 1.0;
          return function() {
            var isLandscape = util.windowAspectRatio() >= 1.0;
            if (isLandscape !== cache) {
              m.redraw();
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

  m.module(util.el('#container'), {
    controller: controller,
    view: view
  });
})(this.app || (this.app = {}));