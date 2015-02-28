(function(global) {
  'use strict';
  var app = global.app || {};
  var m = global.m || require('mithril');

  var Panel = app.Panel;
  var Score = app.Score;

  var TurnController = function(option) {
    this.turnPlayerColor = m.prop(option.turnPlayerColor);
    this.actionTileController = m.prop(option.actionTileController);
    this.whiteControlBoardController = m.prop(option.whiteControlBoardController);
    this.blackControlBoardController = m.prop(option.blackControlBoardController);
  };

  TurnController.prototype.toggleTurnPlayerColor = function() {
    var turnPlayerColor = this.turnPlayerColor();
    if (turnPlayerColor === Panel.COLOR_WHITE)
      this.turnPlayerColor(Panel.COLOR_BLACK);
    else if (turnPlayerColor === Panel.COLOR_BLACK)
      this.turnPlayerColor(Panel.COLOR_WHITE);
  };

  TurnController.prototype.activeControlBoardController = function() {
    var turnPlayerColor = this.turnPlayerColor();
    if (turnPlayerColor === Panel.COLOR_WHITE)
      return this.whiteControlBoardController();
    else if (turnPlayerColor === Panel.COLOR_BLACK)
      return this.blackControlBoardController();
    return null;
  };

  TurnController.prototype.nonActiveControlBoardController = function() {
    var turnPlayerColor = this.turnPlayerColor();
    if (turnPlayerColor === Panel.COLOR_WHITE)
      return this.blackControlBoardController();
    else if (turnPlayerColor === Panel.COLOR_BLACK)
      return this.whiteControlBoardController();
    return null;
  };

  TurnController.prototype.start = function() {
    var turnPlayerColor = this.turnPlayerColor();
    var actionTileController = this.actionTileController();
    var whiteControlBoardController = this.whiteControlBoardController();
    var blackControlBoardController = this.blackControlBoardController();

    // set events
    actionTileController.onscorechange = onScoreChangeActionTileController.bind(this);
    actionTileController.onscoreanimationend = onScoreAnimationEndActionTileController.bind(this);

    whiteControlBoardController.onok = onOkControlBoardController.bind(this);
    whiteControlBoardController.onback = onBackControlBoardController.bind(this);
    whiteControlBoardController.onselect = onSelectControlBoardController.bind(this);

    blackControlBoardController.onok = whiteControlBoardController.onok;
    blackControlBoardController.onback = onBackControlBoardController.bind(this);
    blackControlBoardController.onselect = onSelectControlBoardController.bind(this);

    // initialize
    var nonActiveControlBoardController = this.nonActiveControlBoardController();
    var tile = actionTileController.tile();

    tile.randomEdge();
    whiteControlBoardController.supplyPanel();
    blackControlBoardController.supplyPanel();
    nonActiveControlBoardController.panels()[2] = null;

    // activize
    if (turnPlayerColor === Panel.COLOR_WHITE)
      whiteControlBoardController.active(true);
    else if (turnPlayerColor === Panel.COLOR_BLACK)
      blackControlBoardController.active(true);
  };

  var onScoreChangeActionTileController = function(event) {
    var activeControlBoardController = this.activeControlBoardController();
    var score = activeControlBoardController.score();
    score.add(Score.COLOR_RED, event.red);
    score.add(Score.COLOR_YELLOW, event.yellow);
    score.add(Score.COLOR_GREEN, event.green);
  };

  var onScoreAnimationEndActionTileController = function() {
    var actionTileController = this.actionTileController();
    var activeControlBoardController = this.activeControlBoardController();
    var nonActiveControlBoardController = this.nonActiveControlBoardController();

    var tile = actionTileController.tile();
    var canJointNonActiveBoardPanels = tile.canJointAnyPosition(nonActiveControlBoardController.panels());
    var canJointActiveBoardPanels = tile.canJointAnyPosition(activeControlBoardController.panels());

    nonActiveControlBoardController.supplyPanel();

    if (!canJointNonActiveBoardPanels && !canJointActiveBoardPanels) {
      activeControlBoardController.active(false);
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

        activeControlBoardController.panels([
          Panel.sample(activeControlBoardController.color()),
          Panel.sample(activeControlBoardController.color()),
          null
        ]);
        activeControlBoardController.score().reset();

        this.toggleTurnPlayerColor();
        nonActiveControlBoardController.active(true);

        m.redraw(true);
      }, 500);
    } else {
      this.toggleTurnPlayerColor();
      nonActiveControlBoardController.active(true);
    }

    m.redraw(true);
  };

  var onOkControlBoardController = function() {
    var actionTileController = this.actionTileController();
    var activeControlBoardController = this.activeControlBoardController();

    var tile = actionTileController.tile();
    var panel = actionTileController.selectedPanel();

    if (!panel)
      return;

    var canJointPanels = tile.canJointAnyPosition(activeControlBoardController.panels());
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

    actionTileController.selectedPanel(null);
    actionTileController.selectedPosition(null);
    activeControlBoardController.active(false);
    activeControlBoardController.panels()[activeControlBoardController.selectedIndex()] = null;
    activeControlBoardController.selectedPanel(null);

    if (!canJointPanels && panel) {
      var nonActiveControlBoardController = this.nonActiveControlBoardController();
      nonActiveControlBoardController.supplyPanel();
      this.toggleTurnPlayerColor();
      nonActiveControlBoardController.active(true);
      return;
    }

    actionTileController.startScoreAnimation(row, col);
  };

  var onBackControlBoardController = function() {
    var actionTileController = this.actionTileController();
    actionTileController.selectedPanel(null);
    actionTileController.selectedPosition(null);
  };

  var onSelectControlBoardController = function(event) {
    var actionTileController = this.actionTileController();
    actionTileController.selectedPanel(event.panel);
  };

  app.TurnController = TurnController;
  global.app = app;
}(this));