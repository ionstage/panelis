(function(global) {
  'use strict';
  var app = global.app || {};
  var m = global.m || require('mithril');

  var Panel = app.Panel;
  var Tile = app.Tile;

  app.controller = function() {
    var rowLength = 8;
    var colLength = 8;
    var tile = new Tile(rowLength, colLength);
    tile.randomEdge();

    var selectedPanel = m.prop(null);
    var panelWidth = 72;

    this.tileController = {
      panels: tile.panels,
      panelWidth: m.prop(panelWidth),
      rowLength: m.prop(rowLength),
      colLength: m.prop(colLength)
    };

    var actionTileController = this.actionTileController = new app.ActionTileController({
      selectedPanel: selectedPanel,
      tile: tile,
      panelWidth: panelWidth,
      rowLength: rowLength,
      colLength: colLength
    });

    var scoreAnimationController = this.scoreAnimationController = new app.ScoreAnimationController({
      tile: tile,
      scoreColors: [],
      panelWidth: panelWidth,
      rowLength: rowLength,
      colLength: colLength
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

        var panel = selectedPanel();

        if (!panel)
          return;

        var canJointPanels = tile.canJointAnyPosition(ctrl.panels);
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
        ctrl.panels[ctrl.selectedIndex()] = null;
        ctrl.selectedIndex(-1);
        selectedPanel(null);
        actionTileController.selectedPosition(null);

        if (!canJointPanels && panel) {
          nonActiveControlBoardController.supplyPanel();
          nonActiveControlBoardController.active(true);
          nonActiveControlBoardController = ctrl;
          return;
        }

        scoreAnimationController.start(row, col, ctrl.score, function() {
          nonActiveControlBoardController.supplyPanel();
          var canJointNonActiveBoardPanels = tile.canJointAnyPosition(nonActiveControlBoardController.panels);
          var canJointActiveBoardPanels = tile.canJointAnyPosition(ctrl.panels);
          if (!canJointNonActiveBoardPanels && !canJointActiveBoardPanels) {
            ctrl.active(false);
            setTimeout(function() {
              var message = '';
              var whitePlayerScore = whiteControlBoardController.score.total();
              var blackPlayerScore = blackControlBoardController.score.total();
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
          } else {
            nonActiveControlBoardController.active(true);
            nonActiveControlBoardController = ctrl;
          }

          m.redraw(true);
        });
      },
      onback: function(selectedPanel) {
        actionTileController.selectedPosition(null);
        selectedPanel.resetRotation();
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
        app.view.stageElement = element;
      }
    }, [
      app.tileView(ctrl.tileController),
      app.controlBoardView(ctrl.whiteControlBoardController),
      app.controlBoardView(ctrl.blackControlBoardController),
      app.scoreAnimationView(ctrl.scoreAnimationController),
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

  app.view.panelModule = function(option) {
    return app.panelView(new app.PanelController({
      panel: option.panel,
      x: option.x,
      y: option.y,
      width: option.width
    }));
  };

  m.module(document.getElementById('container'), app);
  global.app = app;
})(this);