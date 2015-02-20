(function(global) {
  'use strict';
  var app = global.app || {};
  var m = global.m || require('mithril');

  var Panel = app.Panel;
  var Tile = app.Tile;

  var stageElement = null;

  app.supportsTouch = 'createTouch' in global.document;
  app.supportsTransitionEnd = (function() {
    var div = document.createElement('div');
    return typeof div.style['transition'] !== 'undefined';
  }());

  app.globalToLocal = function(gpt) {
    if (!stageElement)
      return null;
    var lpt = stageElement.createSVGPoint();
    lpt.x = gpt.x;
    lpt.y = gpt.y;
    return lpt.matrixTransform(stageElement.getScreenCTM().inverse());
  };

  app.controller = function() {
    var tile = new Tile(8, 8);
    tile.randomEdge();

    var selectedPanel = m.prop(null);
    var panelWidth = 72;

    this.tileController = {
      panels: tile.panels,
      panelWidth: m.prop(panelWidth)
    };

    var actionTileController = this.actionTileController = new app.ActionTileController({
      selectedPanel: selectedPanel,
      tile: tile,
      panelWidth: panelWidth
    });

    var scoreAnimationController = this.scoreAnimationController = new app.ScoreAnimationController({
      scoreColors: [],
      tile: tile,
      panelWidth: panelWidth
    });

    var whiteControlBoardController = this.whiteControlBoardController = new app.ControlBoardController({
      color: Panel.COLOR_WHITE,
      panels: [
        Panel.sample(Panel.COLOR_WHITE),
        Panel.sample(Panel.COLOR_WHITE),
        Panel.sample(Panel.COLOR_WHITE)
      ],
      selectedPanel: selectedPanel,
      onok: function() {
        var ctrl = this;
        var position = actionTileController.selectedPosition();
        if (!position)
          return;

        var row = position.row;
        var col = position.col;
        var panel = selectedPanel();
        var canJoint = tile.canJoint(row, col, panel);
        if (!canJoint)
          return;

        tile.panel(row, col, panel);

        ctrl.active(false);
        ctrl.panels[ctrl.selectedIndex()] = null;
        ctrl.selectedIndex(-1);
        selectedPanel(null);
        actionTileController.selectedPosition(null);
        actionTileController.rotationCount(0);

        scoreAnimationController.start(row, col, ctrl.score, function() {
          nonActiveControlBoardController.supplyPanel();

          var canJointNonActiveBoardPanels = actionTileController.canJointAnyPosition(nonActiveControlBoardController.panels);
          var canJointActiveBoardPanels = actionTileController.canJointAnyPosition(ctrl.panels);
          if (!canJointNonActiveBoardPanels && !canJointActiveBoardPanels) {
            ctrl.active(false);
            setTimeout(function() {
              var message = '';
              var whitePlayerScore = whiteControlBoardController.calcScore();
              var blackPlayerScore = blackControlBoardController.calcScore();
              if (whitePlayerScore === blackPlayerScore) {
                message += 'Draw';
              } else {
                var winnerColor = (whitePlayerScore > blackPlayerScore) ? 'white' : 'black';
                message += 'The ' + winnerColor + ' player wins!';
              }
              message += '\n\n[Score]\nwhite: ' + whitePlayerScore + '\nblack: ' + blackPlayerScore;
              alert(message);

              // reset
              tile.reset();
              tile.randomEdge();

              nonActiveControlBoardController.panels = [
                Panel.sample(nonActiveControlBoardController.color()),
                Panel.sample(nonActiveControlBoardController.color()),
                Panel.sample(nonActiveControlBoardController.color())
              ];
              nonActiveControlBoardController.score.reset();

              ctrl.panels = [
                Panel.sample(ctrl.color()),
                Panel.sample(ctrl.color()),
                null
              ];
              ctrl.score.reset();

              nonActiveControlBoardController.active(true);
              nonActiveControlBoardController = ctrl;
              m.redraw(true);
            }, 500);
          } else if (canJointNonActiveBoardPanels) {
            nonActiveControlBoardController.active(true);
            nonActiveControlBoardController = ctrl;
          } else if (canJointActiveBoardPanels) {
            ctrl.supplyPanel();
            ctrl.active(true);
          }

          m.redraw(true);
        });
      },
      onback: function(selectedPanel) {
        actionTileController.selectedPosition(null);
        actionTileController.backRotation(selectedPanel);
      },
      score: new app.Score(),
      panelWidth: panelWidth
    });

    var blackControlBoardController = this.blackControlBoardController = new app.ControlBoardController({
      color: Panel.COLOR_BLACK,
      panels: [
        Panel.sample(Panel.COLOR_BLACK),
        Panel.sample(Panel.COLOR_BLACK),
        null
      ],
      selectedPanel: selectedPanel,
      onok: whiteControlBoardController.onok,
      onback: whiteControlBoardController.onback,
      score: new app.Score(),
      panelWidth: panelWidth
    });

    whiteControlBoardController.active(true);
    var nonActiveControlBoardController = blackControlBoardController;
  };

  app.view = function(ctrl) {
    return m('svg.stage.unselectable', {
      viewBox: '-360,-360,720,720',
      config: function(element, isInitialized) {
        if (isInitialized)
          return;
        stageElement = element;
      }
    }, [
      app.tileView(ctrl.tileController),
      app.controlBoardView(ctrl.whiteControlBoardController),
      app.controlBoardView(ctrl.blackControlBoardController),
      app.scoreAnimationView(ctrl.scoreAnimationController),
      app.actionTileView(ctrl.actionTileController)
    ]);
  };

  m.module(document.getElementById('container'), app);
  global.app = app;
})(this);