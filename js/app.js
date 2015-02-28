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
      firstMoveColor: Panel.COLOR_WHITE,
      actionTileController: this.actionTileController,
      whiteControlBoardController: this.whiteControlBoardController,
      blackControlBoardController: this.blackControlBoardController
    }).start();
  };

  app.view = function(ctrl) {
    return m('svg.stage.unselectable', {
      viewBox: '-360,-360,720,720',
      config: function(element, isInitialized) {
        if (isInitialized)
          return;
        app.view.stageElement = element;
      }
    }, [
      actionTileView(ctrl.actionTileController),
      controlBoardView(ctrl.whiteControlBoardController),
      controlBoardView(ctrl.blackControlBoardController)
    ]);
  };

  app.view.stageElement = null;

  app.view.supportsTouch = 'createTouch' in global.document;

  app.view.supportsTransitionEnd = (function() {
    var div = document.createElement('div');
    return typeof div.style['transition'] !== 'undefined';
  }());

  app.view.globalToLocal = function(gpt) {
    var stageElement = app.view.stageElement;
    if (!stageElement)
      return null;
    var lpt = stageElement.createSVGPoint();
    lpt.x = gpt.x;
    lpt.y = gpt.y;
    return lpt.matrixTransform(stageElement.getScreenCTM().inverse());
  };

  app.view.panel = function(option) {
    return panelView({
      panel: m.prop(option.panel),
      x: m.prop(option.x),
      y: m.prop(option.y),
      width: m.prop(option.width)
    });
  };

  app.view.showResult = function(whitePlayerScore, blackPlayerScore) {
    var message = '';
    var whitePlayerScoreTotal = whitePlayerScore.total();
    var blackPlayerScoreTotal = blackPlayerScore.total();
    if (whitePlayerScoreTotal === blackPlayerScoreTotal) {
      message += 'Draw';
    } else {
      var winnerColor = (whitePlayerScoreTotal > blackPlayerScoreTotal) ?
                        'white' : 'black';
      message += 'The ' + winnerColor + ' player wins!';
    }
    message += '\n\n[Score]\nwhite: ' + whitePlayerScoreTotal +
               '\nblack: ' + blackPlayerScoreTotal;
    alert(message);
  };

  m.module(document.getElementById('container'), app);
  global.app = app;
})(this);