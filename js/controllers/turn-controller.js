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

  TurnController.prototype.start = function() {
    initEvent(this);
    reset(this);
    activate(this);
  };

  var activeControlBoardController = function(ctrl) {
    var turnPlayerColor = ctrl.turnPlayerColor();
    if (turnPlayerColor === Panel.COLOR_WHITE)
      return ctrl.whiteControlBoardController();
    else if (turnPlayerColor === Panel.COLOR_BLACK)
      return ctrl.blackControlBoardController();
    return null;
  };

  var nonActiveControlBoardController = function(ctrl) {
    var turnPlayerColor = ctrl.turnPlayerColor();
    if (turnPlayerColor === Panel.COLOR_WHITE)
      return ctrl.blackControlBoardController();
    else if (turnPlayerColor === Panel.COLOR_BLACK)
      return ctrl.whiteControlBoardController();
    return null;
  };

  var toggleTurnPlayerColor = function(ctrl) {
    var turnPlayerColor = ctrl.turnPlayerColor();
    if (turnPlayerColor === Panel.COLOR_WHITE)
      ctrl.turnPlayerColor(Panel.COLOR_BLACK);
    else if (turnPlayerColor === Panel.COLOR_BLACK)
      ctrl.turnPlayerColor(Panel.COLOR_WHITE);
  };

  var initEvent = function(ctrl) {
    var actionTileController = ctrl.actionTileController();
    var whiteControlBoardController = ctrl.whiteControlBoardController();
    var blackControlBoardController = ctrl.blackControlBoardController();

    actionTileController.onscorechange = onScoreChangeActionTileController.bind(ctrl);
    actionTileController.onscoreanimationend = onScoreAnimationEndActionTileController.bind(ctrl);
    whiteControlBoardController.onok = onOkControlBoardController.bind(ctrl);
    whiteControlBoardController.onback = onBackControlBoardController.bind(ctrl);
    whiteControlBoardController.onselect = onSelectControlBoardController.bind(ctrl);
    blackControlBoardController.onok = whiteControlBoardController.onok;
    blackControlBoardController.onback = onBackControlBoardController.bind(ctrl);
    blackControlBoardController.onselect = onSelectControlBoardController.bind(ctrl);
  };

  var reset = function(ctrl) {
    var actionTileController = ctrl.actionTileController();
    var activeController = activeControlBoardController(ctrl);
    var nonActiveController = nonActiveControlBoardController(ctrl);

    var activeControllerColor = activeController.color();
    var nonActiveControllerColor = nonActiveController.color();

    actionTileController.reset();

    activeController.panels([
      Panel.sample(activeControllerColor),
      Panel.sample(activeControllerColor),
      Panel.sample(activeControllerColor)
    ]);

    activeController.resetScore();

    nonActiveController.panels([
      Panel.sample(nonActiveControllerColor),
      Panel.sample(nonActiveControllerColor),
      null
    ]);

    nonActiveController.resetScore();
  };

  var activate = function(ctrl) {
    var activeController = activeControlBoardController(ctrl);
    var nonActiveController = nonActiveControlBoardController(ctrl);
    activeController.active(true);
    nonActiveController.active(false);
  };

  var deactivate = function(ctrl) {
    var activeController = activeControlBoardController(ctrl);
    var nonActiveController = nonActiveControlBoardController(ctrl);
    activeController.active(false);
    nonActiveController.active(false);
  };

  var gameEnd = function(ctrl) {
    setTimeout(function() {
      showResult(ctrl);

      // next game
      toggleTurnPlayerColor(ctrl);
      reset(ctrl);
      activate(ctrl);

      m.redraw(true);
    }, 500);
  };

  var showResult = function(ctrl) {
    var whiteControlBoardController = ctrl.whiteControlBoardController();
    var blackControlBoardController = ctrl.blackControlBoardController();

    var message = '';
    var whitePlayerScoreTotal = whiteControlBoardController.totalScore();
    var blackPlayerScoreTotal = blackControlBoardController.totalScore();
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

  var onScoreChangeActionTileController = function(event) {
    var activeController = activeControlBoardController(this);
    activeController.addScore(Score.COLOR_RED, event.red);
    activeController.addScore(Score.COLOR_YELLOW, event.yellow);
    activeController.addScore(Score.COLOR_GREEN, event.green);
  };

  var onScoreAnimationEndActionTileController = function() {
    var actionTileController = this.actionTileController();
    var activeController = activeControlBoardController(this);
    var nonActiveController = nonActiveControlBoardController(this);

    // supply panel before calculating canJointNonActiveBoardPanels
    nonActiveController.supplyPanel();

    var canJointNonActiveBoardPanels = actionTileController.canJointAnyPosition(nonActiveController.panels());
    var canJointActiveBoardPanels = actionTileController.canJointAnyPosition(activeController.panels());

    if (!canJointNonActiveBoardPanels && !canJointActiveBoardPanels) {
      gameEnd(this);
    } else {
      toggleTurnPlayerColor(this);
      activate(this);
    }

    m.redraw(true);
  };

  var onOkControlBoardController = function() {
    var actionTileController = this.actionTileController();
    var activeController = activeControlBoardController(this);

    var selectedPanel = actionTileController.selectedPanel();
    var canJointPanels = actionTileController.canJointAnyPosition(activeController.panels());
    var position = actionTileController.selectedPosition();

    if (!selectedPanel)
      return;

    // player can't set panel any position, but set
    if (!canJointPanels && position)
      return;

    // player can't set panel and select panel
    if (!canJointPanels) {
      actionTileController.clearSelection();
      activeController.removeSelectedPanel();
      toggleTurnPlayerColor(this);
      activeController = activeControlBoardController(this);
      activeController.supplyPanel();
      activate(this);
      return;
    }

    // player can set panel, but not set
    if (!position)
      return;

    var row = position.row;
    var col = position.col;

    // player can set panel, but can't joint panel
    if (!actionTileController.canJoint(row, col, selectedPanel))
      return;

    deactivate(this);
    actionTileController.panel(row, col, selectedPanel);
    actionTileController.clearSelection();
    activeController.removeSelectedPanel();
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

  app.TurnController = TurnController;
  global.app = app;
}(this));