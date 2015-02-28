(function(global) {
  'use strict';
  var app = global.app || {};
  var m = global.m || require('mithril');

  var Panel = app.Panel;
  var TileController = app.TileController;
  var ActionTileController = app.ActionTileController;
  var ControlBoardController = app.ControlBoardController;

  var TurnController = function(option) {
    this.firstMoveColor = m.prop(option.firstMoveColor);
    this.actionTileController = m.prop(option.actionTileController);
    this.whiteControlBoardController = m.prop(option.whiteControlBoardController);
    this.blackControlBoardController = m.prop(option.blackControlBoardController);
  };

  TurnController.prototype.start = function() {
    var firstMoveColor = this.firstMoveColor();
    var actionTileController = this.actionTileController();
    var whiteControlBoardController = this.whiteControlBoardController();
    var blackControlBoardController = this.blackControlBoardController();

    var tile = actionTileController.tile();
    var selectedPanel = m.prop(null);
    var nonActiveControlBoardController = (firstMoveColor === Panel.COLOR_WHITE) ? blackControlBoardController : whiteControlBoardController;

    tile.randomEdge();

    whiteControlBoardController.supplyPanel();
    blackControlBoardController.supplyPanel();

    nonActiveControlBoardController.panels()[2] = null;

    actionTileController.selectedPanel = selectedPanel;
    whiteControlBoardController.selectedPanel = selectedPanel;
    blackControlBoardController.selectedPanel = selectedPanel;

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

      actionTileController.onscoreanimationend = function() {
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

      actionTileController.startScoreAnimation(row, col, ctrl.score());
    };

    whiteControlBoardController.onback = function(selectedPanel) {
      actionTileController.selectedPosition(null);
      selectedPanel.resetRotation();
    };

    blackControlBoardController.onok = whiteControlBoardController.onok;
    blackControlBoardController.onback = whiteControlBoardController.onback;

    if (firstMoveColor === Panel.COLOR_WHITE)
      whiteControlBoardController.active(true);
    else if (firstMoveColor === Panel.COLOR_BLACK)
      blackControlBoardController.active(true);
  };

  app.TurnController = TurnController;
  global.app = app;
}(this));