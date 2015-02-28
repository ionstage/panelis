(function(global) {
  'use strict';
  var app = global.app || {};
  var m = global.m || require('mithril');

  var Panel = app.Panel;
  var Tile = app.Tile;

  app.controller = function() {
    var rowLength = 8;
    var colLength = 8;
    var panelWidth = 72;

    var tile = new Tile(rowLength, colLength);

    var actionTileController = this.actionTileController = new app.ActionTileController({
      tile: tile,
      panelWidth: panelWidth
    });

    var whiteControlBoardController = this.whiteControlBoardController = new app.ControlBoardController({
      color: Panel.COLOR_WHITE,
      score: new app.Score(),
      panelWidth: panelWidth
    });

    var blackControlBoardController = this.blackControlBoardController = new app.ControlBoardController({
      color: Panel.COLOR_BLACK,
      score: new app.Score(),
      panelWidth: panelWidth
    });

    new app.TurnController({
      firstMoveColor: Panel.COLOR_WHITE,
      actionTileController: actionTileController,
      whiteControlBoardController: whiteControlBoardController,
      blackControlBoardController: blackControlBoardController
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
      app.actionTileView(ctrl.actionTileController),
      app.controlBoardView(ctrl.whiteControlBoardController),
      app.controlBoardView(ctrl.blackControlBoardController)
    ]);
  };

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
    return app.panelView({
      panel: m.prop(option.panel || null),
      x: m.prop(option.x || 0),
      y: m.prop(option.y || 0),
      width: m.prop(option.width || 72)
    });
  };

  app.view.showResult = function(whitePlayerScore, blackPlayerScore) {
    var message = '';
    var whitePlayerScoreTotal = whitePlayerScore.total();
    var blackPlayerScoreTotal = blackPlayerScore.total();
    if (whitePlayerScoreTotal === blackPlayerScoreTotal) {
      message += 'Draw';
    } else {
      var winnerColor = (whitePlayerScoreTotal > blackPlayerScoreTotal) ? 'white' : 'black';
      message += 'The ' + winnerColor + ' player wins!';
    }
    message += '\n\n[Score]\nwhite: ' + whitePlayerScoreTotal + '\nblack: ' + blackPlayerScoreTotal;
    alert(message);
  };

  m.module(document.getElementById('container'), app);
  global.app = app;
})(this);