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

  TurnController.prototype.initEvent = function() {
    var actionTileController = this.actionTileController();
    var whiteControlBoardController = this.whiteControlBoardController();
    var blackControlBoardController = this.blackControlBoardController();

    actionTileController.onscorechange = onScoreChangeActionTileController.bind(this);
    actionTileController.onscoreanimationend = onScoreAnimationEndActionTileController.bind(this);
    whiteControlBoardController.onok = onOkControlBoardController.bind(this);
    whiteControlBoardController.onback = onBackControlBoardController.bind(this);
    whiteControlBoardController.onselect = onSelectControlBoardController.bind(this);
    blackControlBoardController.onok = whiteControlBoardController.onok;
    blackControlBoardController.onback = onBackControlBoardController.bind(this);
    blackControlBoardController.onselect = onSelectControlBoardController.bind(this);
  };

  TurnController.prototype.start = function() {
    this.initEvent();
    this.reset();
    this.activate();
  };

  TurnController.prototype.reset = function() {
    var actionTileController = this.actionTileController();
    var activeControlBoardController = this.activeControlBoardController();
    var nonActiveControlBoardController = this.nonActiveControlBoardController();

    var tile = actionTileController.tile();
    var activePlayerColor = activeControlBoardController.color();
    var nonActivePlayerColor = nonActiveControlBoardController.color();

    tile.reset();
    tile.randomEdge();

    activeControlBoardController.panels([
      Panel.sample(activePlayerColor),
      Panel.sample(activePlayerColor),
      Panel.sample(activePlayerColor)
    ]);

    activeControlBoardController.resetScore();

    nonActiveControlBoardController.panels([
      Panel.sample(nonActivePlayerColor),
      Panel.sample(nonActivePlayerColor),
      null
    ]);

    nonActiveControlBoardController.resetScore();
  };

  TurnController.prototype.activate = function() {
    var activeControlBoardController = this.activeControlBoardController();
    var nonActiveControlBoardController = this.nonActiveControlBoardController();
    activeControlBoardController.active(true);
    nonActiveControlBoardController.active(false);
  };

  TurnController.prototype.deactivate = function() {
    var activeControlBoardController = this.activeControlBoardController();
    var nonActiveControlBoardController = this.nonActiveControlBoardController();
    activeControlBoardController.active(false);
    nonActiveControlBoardController.active(false);
  };

  TurnController.prototype.gameEnd = function() {
    setTimeout((function() {
      showResult(this);

      // next game
      this.toggleTurnPlayerColor();
      this.reset();
      this.activate();

      m.redraw(true);
    }).bind(this), 500);
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

    // supply panel before calculating canJointNonActiveBoardPanels
    nonActiveControlBoardController.supplyPanel();

    var tile = actionTileController.tile();
    var canJointNonActiveBoardPanels = tile.canJointAnyPosition(nonActiveControlBoardController.panels());
    var canJointActiveBoardPanels = tile.canJointAnyPosition(activeControlBoardController.panels());

    if (!canJointNonActiveBoardPanels && !canJointActiveBoardPanels) {
      this.gameEnd();
    } else {
      this.toggleTurnPlayerColor();
      this.activate();
    }

    m.redraw(true);
  };

  var onOkControlBoardController = function() {
    var actionTileController = this.actionTileController();
    var activeControlBoardController = this.activeControlBoardController();

    var tile = actionTileController.tile();
    var selectedPanel = actionTileController.selectedPanel();
    var canJointPanels = tile.canJointAnyPosition(activeControlBoardController.panels());
    var position = actionTileController.selectedPosition();

    if (!selectedPanel)
      return;

    // player can't set panel any position, but set
    if (!canJointPanels && position)
      return;

    // player can't set panel and select panel
    if (!canJointPanels) {
      actionTileController.clearSelection();
      activeControlBoardController.removeSelectedPanel();
      this.toggleTurnPlayerColor();
      activeControlBoardController = this.activeControlBoardController();
      activeControlBoardController.supplyPanel();
      this.activate();
      return;
    }

    // player can set panel, but not set
    if (!position)
      return;

    var row = position.row;
    var col = position.col;

    // player can set panel, but can't joint panel
    if (!tile.canJoint(row, col, selectedPanel))
      return;

    this.deactivate();
    tile.panel(row, col, selectedPanel);
    actionTileController.clearSelection();
    activeControlBoardController.removeSelectedPanel();
    actionTileController.startScoreAnimation(row, col);
  };

  var onBackControlBoardController = function() {
    var actionTileController = this.actionTileController();
    actionTileController.clearSelection();
  };

  var onSelectControlBoardController = function(event) {
    var actionTileController = this.actionTileController();
    actionTileController.selectedPanel(event.panel);
  };

  var showResult = function(ctrl) {
    var whiteControlBoardController = ctrl.whiteControlBoardController();
    var blackControlBoardController = ctrl.blackControlBoardController();

    var message = '';
    var whitePlayerScoreTotal = whiteControlBoardController.score().total();
    var blackPlayerScoreTotal = blackControlBoardController.score().total();
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

  app.TurnController = TurnController;
  global.app = app;
}(this));