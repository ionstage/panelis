(function(app) {
  'use strict';

  var helper = app.helper || require('./helper.js');
  var dom = app.dom || require('./dom.js');
  var Panel = app.Panel || require('./components/panel.js');
  var Board = app.Board || require('./components/board.js');
  var ControllerComponent = app.ControllerComponent || require('./components/controller-component.js');
  var Root = app.Root || require('./components/root.js');
  var ControllerRelation = app.ControllerRelation || require('./relations/controller-relation.js');
  var ControllerBoardRelation = app.ControllerBoardRelation || require('./relations/controller-board-relation.js');

  var App = function() {
    helper.bindAll(this);

    this.board = new Board({
      rowLength: 8,
      colLength: 8,
      element: dom.el('.board'),
      pointer: this.pointer
    });

    this.whiteController = new ControllerComponent({
      color: ControllerComponent.COLOR_WHITE,
      element: dom.el('.controller[data-color="white"]'),
      okExecutor: this.okExecutor,
      backExecutor: this.backExecutor
    });

    this.blackController = new ControllerComponent({
      color: ControllerComponent.COLOR_BLACK,
      element: dom.el('.controller[data-color="black"]'),
      okExecutor: this.okExecutor,
      backExecutor: this.backExecutor
    });

    this.root = new Root({
      widthPerFontSize: 66,
      heightPerFontSize: 106,
      element: dom.root()
    });

    this.controllerRelation = new ControllerRelation({
      whiteController: this.whiteController,
      blackController: this.blackController
    });

    this.whiteControllerBoardRelation = new ControllerBoardRelation({
      controller: this.whiteController,
      board: this.board
    });

    this.blackControllerBoardRelation = new ControllerBoardRelation({
      controller: this.blackController,
      board: this.board
    });

    this.whiteController.relations([this.controllerRelation, this.whiteControllerBoardRelation]);
    this.blackController.relations([this.controllerRelation, this.blackControllerBoardRelation]);

    this.board.reset();
    this.whiteController.reset();
    this.blackController.reset();

    this.whiteController.fillEmptySlot();
    this.whiteController.disabled(false);
  };

  App.prototype.pointer = function(row, col) {
    var board = this.board;
    var enabledController = this.controllerRelation.enabledController();

    if (!enabledController)
      return;

    var controllerSelectedPanel = enabledController.selectedPanel();
    var boardSelectedPanel = board.selectedPanel();

    if (!board.panel(row, col) && controllerSelectedPanel) {
      // move the selected panel from the controller to the board
      enabledController.panel(enabledController.selectedPanelIndex(), null);
      var panel = new Panel(controllerSelectedPanel.props());

      if (enabledController === this.blackController) {
        // reverse the panel of the black controller
        panel.rotate();
        panel.rotate();
      }

      board.panel(row, col, panel);
      board.selectedPanel(panel);
    } else if (boardSelectedPanel) {
      // rotate the selected panel on the board
      boardSelectedPanel.rotateWithAnimation().then(function() {
        // update ok-button
        enabledController.markDirty();
      });
    }
  };

  App.prototype.okExecutor = function() {
    var board = this.board;

    if (!board.selectedPanel()) {
      var root = this.root;
      var controllerRelation = this.controllerRelation;

      var enabledController = controllerRelation.enabledController();
      var disabledController = controllerRelation.disabledController();

      enabledController.removePanel(enabledController.selectedPanel());
      enabledController.disabled(true);
      disabledController.fillEmptySlot();

      root.disabled(true);

      setTimeout(function() {
        var canSetAnyPosition = disabledController.panels().map(function(panel) {
          return board.canSetAnyPosition(panel);
        }).some(helper.identity);

        if (!canSetAnyPosition) {
          // both controllers has no panels which can be set
          this.endGame();
        }

        root.disabled(false);
      }.bind(this), 250);

      return;
    }

    this.endTurn().then(function() {
      if (!board.hasEmptyPosition())
        this.endGame();
    }.bind(this));
  };

  App.prototype.backExecutor = function() {
    var board = this.board;
    var enabledController = this.controllerRelation.enabledController();

    var selectedPanel = board.selectedPanel();

    if (!selectedPanel)
      return;

    // move the selected panel from the board to the controller
    board.removePanel(selectedPanel);
    var panel = new Panel(selectedPanel.props());
    panel.resetRotation();
    enabledController.panel(enabledController.emptySlotIndex(), panel);
    enabledController.selectedPanel(panel);
  };

  App.prototype.endTurn = function() {
    var board = this.board;
    var root = this.root;
    var controllerRelation = this.controllerRelation;

    var selectedPanel = board.selectedPanel();
    var connectedPanels = board.connectedPanels(selectedPanel);
    var enabledController = controllerRelation.enabledController();
    var disabledController = controllerRelation.disabledController();

    root.disabled(true);
    board.selectedPanel(null);

    // update buttons
    enabledController.markDirty();

    var timeout250 = function() {
      return helper.timeout(250);
    };

    var fixSelectedPanel = function() {
      if (!board.isAllJointsConnected(selectedPanel))
        return;

      selectedPanel.isFixed(true);
      enabledController.incrementScore(ControllerComponent.SCORE_TYPE_FIX);

      return selectedPanel.flash(Panel.FLASH_COLOR_GREEN).then(timeout250);
    };

    var dischargeColorToConnectedPanels = function() {
      var selectedPanelColor = selectedPanel.color();

      var panels = connectedPanels.filter(function(panel) {
        return (!panel.isFixed() && panel.color() !== selectedPanelColor);
      });

      if (panels.length === 0)
        return;

      return Promise.all(panels.map(function(panel) {
        return panel.gradateColor(selectedPanelColor);
      })).then(timeout250);
    };

    var eraseOrFixConnectedPanels = function() {
      var panels = connectedPanels.filter(function(panel) {
        return (!panel.isFixed() && board.isAllJointsConnected(panel));
      });

      if (panels.length === 0)
        return;

      return Promise.all(panels.map(function(panel) {
        if (panel.color() === Panel.COLOR_GRAY) {
          // erase panel
          board.removePanel(panel);
          enabledController.incrementScore(ControllerComponent.SCORE_TYPE_ERASE);
          return selectedPanel.flash(Panel.FLASH_COLOR_RED);
        } else {
          // fix panel
          panel.isFixed(true);
          enabledController.incrementScore(ControllerComponent.SCORE_TYPE_FIX);
          return panel.flash(Panel.FLASH_COLOR_GREEN);
        }
      })).then(timeout250);
    };

    var chainConnectedPanels = function() {
      var chainList = board.chainList(selectedPanel);

      if (chainList.length === 0)
        return;

      return chainList.reduce(function(prev, curr) {
        return prev.then(function() {
          return Promise.all(curr.map(function(panel) {
            enabledController.incrementScore(ControllerComponent.SCORE_TYPE_CHAIN);
            return panel.flash(Panel.FLASH_COLOR_YELLOW);
          }));
        });
      }, Promise.resolve()).then(timeout250);
    };

    var nextTurn = function() {
      enabledController.disabled(true);
      disabledController.fillEmptySlot();
      root.disabled(false);
    };

    return Promise.resolve()
                  .then(timeout250)
                  .then(fixSelectedPanel)
                  .then(dischargeColorToConnectedPanels)
                  .then(eraseOrFixConnectedPanels)
                  .then(chainConnectedPanels)
                  .then(nextTurn);
  };

  App.prototype.endGame = function() {
    var whiteController = this.whiteController;
    var blackController = this.blackController;

    var whiteScore = whiteController.totalScore();
    var blackScore = blackController.totalScore();

    var message;
    var enabledController;

    if (whiteScore === blackScore) {
      message = 'Draw';
      enabledController = (Math.random() < 0.5) ? whiteController : blackController;
    } else {
      message = ((whiteScore > blackScore) ? 'White' : 'Black') + ' wins!';
      enabledController = (whiteScore > blackScore) ? blackController : whiteController;
    }

    message += '\n\n[Score]\nWhite: ' + whiteScore + '\nBlack: ' + blackScore;

    // show result
    alert(message);

    // start next game
    this.board.reset();
    whiteController.reset();
    blackController.reset();

    enabledController.fillEmptySlot();
    enabledController.disabled(false);
  };

  app.main = new App();
})(this.app || (this.app = {}));