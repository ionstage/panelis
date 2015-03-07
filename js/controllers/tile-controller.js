(function(global) {
  'use strict';
  var app = global.app || {};
  var m = global.m || require('mithril');

  var Panel = app.Panel;
  var Tile = app.Tile;
  var Score = app.Score;

  var TileController = function() {
    var noop = function() {};
    this.tile = m.prop(new Tile({rowLength: 8, colLength: 8}));
    this.panelWidth = m.prop(72);
    this.scoreColors = m.prop([]);
    this.onscorechange = noop;
    this.onscoreanimationend = noop;
  };

  TileController.prototype.panels = function() {
    return this.tile().panels();
  };

  TileController.prototype.rowLength = function() {
    return this.tile().rowLength();
  };

  TileController.prototype.colLength = function() {
    return this.tile().colLength();
  };

  TileController.prototype.panel = function(row, col, panel) {
    this.tile().panel(row, col, panel);
  };

  TileController.prototype.canJoint = function(row, col, panel) {
    return this.tile().canJoint(row, col, panel);
  };

  TileController.prototype.canJointAnyPosition = function(panels) {
    return this.tile().canJointAnyPosition(panels);
  };

  TileController.prototype.reset = function() {
    var tile = this.tile();
    tile.reset();
    tile.randomEdge();
  };

  TileController.prototype.startScoreAnimation = function(row, col) {
    var ctrl = this;
    var animations = [
      fixStartPanelAnimation,
      releaseColorAnimation,
      fixJointedPanelAnimation,
      chainAnimation
    ];

    setTimeout(function() {
      (function animate(index) {
        var animation = animations[index];
        if (!animation) {
          ctrl.onscoreanimationend();
          return;
        }

        var wait = animation(ctrl, row, col, animations);
        if (wait)
          m.redraw(true);

        setTimeout(function() {
          m.redraw(true);
          animate(index + 1);
          clearScoreColors(ctrl);
        }, wait ? 500 : 0);
      }(0));
    }, 250);
  };

  var pushScoreColor = function(ctrl, scoreColor) {
    ctrl.scoreColors().push(scoreColor);
  };

  var clearScoreColors = function(ctrl) {
    ctrl.scoreColors([]);
  };

  var fixStartPanelAnimation = function(ctrl, row, col) {
    var tile = ctrl.tile();

    if (!tile.canFix(row, col))
      return false;

    tile.fix(row, col);
    pushScoreColor(ctrl, {row: row, col: col, color: Score.COLOR_GREEN});
    ctrl.onscorechange({red: 0, yellow:0, green: 1});

    return true;
  };

  var releaseColorAnimation = function(ctrl, row, col) {
    return ctrl.tile().releaseColor(row, col);
  };

  var fixJointedPanelAnimation = function(ctrl, row, col) {
    var isFixed = false;
    var score = {red: 0, yellow: 0, green: 0};

    // top
    isFixed = fixJointedPanel(ctrl, row, col, row - 1, col, score) || isFixed;
    // right
    isFixed = fixJointedPanel(ctrl, row, col, row, col + 1, score) || isFixed;
    // bottom
    isFixed = fixJointedPanel(ctrl, row, col, row + 1, col, score) || isFixed;
    // left
    isFixed = fixJointedPanel(ctrl, row, col, row, col - 1, score) || isFixed;

    ctrl.onscorechange(score);

    return isFixed;
  };

  var fixJointedPanel = function(ctrl, row0, col0, row1, col1, score) {
    var tile = ctrl.tile();
    var jointedPanel = tile.panel(row1, col1);

    if (!jointedPanel || !tile.isJointed(row0, col0, row1, col1))
      return false;

    if (jointedPanel.color() === Panel.COLOR_BROWN)
      return false;

    if (!tile.canFix(row1, col1) || jointedPanel.isFixed())
      return false;

    if (jointedPanel.color() === Panel.COLOR_GRAY) {
      tile.panel(row1, col1, null);
      pushScoreColor(ctrl, {row: row0, col: col0, color: Score.COLOR_RED});
      score.red += 1;
    } else {
      tile.fix(row1, col1);
      pushScoreColor(ctrl, {row: row1, col: col1, color: Score.COLOR_GREEN});
      score.green += 1;
    }

    return true;
  };

  var chainAnimation = function(ctrl, row, col, animations) {
    var tile = ctrl.tile();
    var chainList = tile.calcChain(row, col);

    if (chainList.length < 2)
      return false;

    var chainAnimations = chainList.map(function(chains) {
      return function() {
        chains.forEach(function(chain) {
          pushScoreColor(ctrl, {
            row: chain.row,
            col: chain.col,
            color: Score.COLOR_YELLOW
          });
          ctrl.onscorechange({red: 0, yellow:1, green: 0});
        });
        return true;
      };
    });

    Array.prototype.push.apply(animations, chainAnimations);

    return false;
  };

  app.TileController = TileController;
  global.app = app;
}(this));