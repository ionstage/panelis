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

    var selectedPanel = m.prop(null);

    var tileController = this.tileController = new app.TileController({
      tile: tile,
      panelWidth: panelWidth,
      rowLength: rowLength,
      colLength: colLength
    });

    var actionTileController = this.actionTileController = new app.ActionTileController({
      tile: tile,
      panelWidth: panelWidth,
      rowLength: rowLength,
      colLength: colLength
    });

    actionTileController.selectedPanel = selectedPanel;

    var whiteControlBoardController = this.whiteControlBoardController = new app.ControlBoardController({
      color: Panel.COLOR_WHITE,
      panels: [
        Panel.sample(Panel.COLOR_WHITE),
        Panel.sample(Panel.COLOR_WHITE),
        Panel.sample(Panel.COLOR_WHITE)
      ],
      score: new app.Score(),
      panelWidth: panelWidth
    });

    whiteControlBoardController.selectedPanel = selectedPanel;

    whiteControlBoardController.onok = function() {
      var ctrl = this;

      var panel = selectedPanel();

      if (!panel)
        return;

      var canJointPanels = tile.canJointAnyPosition(ctrl.panels());
      var position = actionTileController.selectedPosition();

      if (canJointPanels && !position)
        return;

      if (canJointPanels && position) {
        var row = position.row;
        var col = position.col;
        var canJoint = tile.canJoint(row, col, panel);

        if (!canJoint)
          return;

        tile.panel(row, col, panel);
      }

      ctrl.active(false);
      ctrl.panels()[ctrl.selectedIndex()] = null;
      ctrl.selectedIndex(-1);
      selectedPanel(null);
      actionTileController.selectedPosition(null);

      if (!canJointPanels && panel) {
        nonActiveControlBoardController.supplyPanel();
        nonActiveControlBoardController.active(true);
        nonActiveControlBoardController = ctrl;
        return;
      }

      tileController.onscoreanimationend = function() {
        nonActiveControlBoardController.supplyPanel();
        var canJointNonActiveBoardPanels = tile.canJointAnyPosition(nonActiveControlBoardController.panels());
        var canJointActiveBoardPanels = tile.canJointAnyPosition(ctrl.panels());
        if (!canJointNonActiveBoardPanels && !canJointActiveBoardPanels) {
          ctrl.active(false);
          setTimeout(function() {
            // show result
            var whitePlayerScore = whiteControlBoardController.score();
            var blackPlayerScore = blackControlBoardController.score();
            app.view.showResult(whitePlayerScore, blackPlayerScore);

            // reset
            tile.reset();
            tile.randomEdge();

            nonActiveControlBoardController.panels([
              Panel.sample(nonActiveControlBoardController.color()),
              Panel.sample(nonActiveControlBoardController.color()),
              Panel.sample(nonActiveControlBoardController.color())
            ]);
            nonActiveControlBoardController.score().reset();

            ctrl.panels([
              Panel.sample(ctrl.color()),
              Panel.sample(ctrl.color()),
              null
            ]);
            ctrl.score().reset();

            nonActiveControlBoardController.active(true);
            nonActiveControlBoardController = ctrl;
            m.redraw(true);
          }, 500);
        } else {
          nonActiveControlBoardController.active(true);
          nonActiveControlBoardController = ctrl;
        }

        m.redraw(true);
      };

      tileController.startScoreAnimation(row, col, ctrl.score());
    };

    whiteControlBoardController.onback = function(selectedPanel) {
      actionTileController.selectedPosition(null);
      selectedPanel.resetRotation();
    };

    var blackControlBoardController = this.blackControlBoardController = new app.ControlBoardController({
      color: Panel.COLOR_BLACK,
      panels: [
        Panel.sample(Panel.COLOR_BLACK),
        Panel.sample(Panel.COLOR_BLACK),
        null
      ],
      score: new app.Score(),
      panelWidth: panelWidth
    });

    blackControlBoardController.selectedPanel = selectedPanel;

    blackControlBoardController.onok = whiteControlBoardController.onok;

    blackControlBoardController.onback = whiteControlBoardController.onback;

    var nonActiveControlBoardController = blackControlBoardController;

    tile.randomEdge();
    whiteControlBoardController.active(true);
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
      app.tileView(ctrl.tileController),
      app.controlBoardView(ctrl.whiteControlBoardController),
      app.controlBoardView(ctrl.blackControlBoardController),
      app.actionTileView(ctrl.actionTileController)
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