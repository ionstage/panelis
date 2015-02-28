(function(global) {
  'use strict';
  var app = global.app || {};
  var m = global.m || require('mithril');

  var Panel = app.Panel;
  var Tile = app.Tile;
  var Score = app.Score;

  var noop = function() {};

  var TileController = function() {
    this.tile = m.prop(new Tile());
    this.panelWidth = m.prop(72);
    this.scoreColors = m.prop([]);
    this.onscorechange = noop;
    this.onscoreanimationend = noop;
  };

  TileController.prototype.pushScoreColor = function(scoreColor) {
    this.scoreColors().push(scoreColor);
  };

  TileController.prototype.clearScoreColors = function() {
    this.scoreColors([]);
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
          ctrl.clearScoreColors();
        }, wait ? 500 : 0);
      }(0));
    }, 250);
  };

  var fixStartPanelAnimation = function(ctrl, row, col) {
    var tile = ctrl.tile();

    if (!tile.canFix(row, col))
      return false;

    tile.fix(row, col);
    ctrl.pushScoreColor({row: row, col: col, color: Score.COLOR_GREEN});
    ctrl.onscorechange({red: 0, yellow:0, green: 1});

    return true;
  };

  var releaseColorAnimation = function(ctrl, row, col) {
    return ctrl.tile().releaseColor(row, col);
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
      ctrl.pushScoreColor({row: row0, col: col0, color: Score.COLOR_RED});
      score.red += 1;
    } else {
      tile.fix(row1, col1);
      ctrl.pushScoreColor({row: row1, col: col1, color: Score.COLOR_GREEN});
      score.green += 1;
    }

    return true;
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

  var chainAnimation = function(ctrl, row, col, animations) {
    var tile = ctrl.tile();
    var chainList = tile.calcChain(row, col);

    if (chainList.length < 2)
      return false;

    var chainAnimations = chainList.map(function(chains) {
      return function() {
        chains.forEach(function(chain) {
          ctrl.pushScoreColor({
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