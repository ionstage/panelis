(function(global) {
  'use strict';
  var app = global.app || {};
  var m = global.m || require('mithril');

  var Panel = app.Panel;
  var Tile = app.Tile;
  var Score = app.Score;

  var ScoreAnimationController = function(option) {
    this.tile = m.prop(option.tile || new Tile());
    this.panelWidth = m.prop(option.panelWidth || 72);
    this.rowLength = m.prop(option.rowLength || 8);
    this.colLength = m.prop(option.colLength || 8);
    this.scoreColors = m.prop(option.scoreColors || []);
    this.score = m.prop(option.score || new Score());
  };

  ScoreAnimationController.prototype.pushScoreColor = function(scoreColor) {
    this.scoreColors().push(scoreColor);
  };

  ScoreAnimationController.prototype.clearScoreColors = function() {
    this.scoreColors([]);
  };

  ScoreAnimationController.prototype.start = function(row, col, callback) {
    var ctrl = this;
    var animations = [
      fixStartPanelAnimation,
      releaseColorAnimation,
      fixJointedPanelAnimation,
      chainAnimation
    ];

    m.redraw.strategy('none');
    ctrl.clearScoreColors();

    setTimeout(function() {
      (function animate(index) {
        var animation = animations[index];
        if (!animation) {
          callback();
          return;
        }

        m.startComputation();
        var wait = animation(ctrl, row, col, animations);
        if (wait) {
          m.redraw(true);
          ctrl.clearScoreColors();
        }
        setTimeout(function() {
          m.endComputation();
          animate(index + 1);
        }, wait ? 500 : 0);
      }(0));
    }, 250);
  };

  var fixStartPanelAnimation = function(ctrl, row, col) {
    var tile = ctrl.tile();
    var score = ctrl.score();

    if (tile.canFix(row, col)){
      tile.fix(row, col);
      ctrl.pushScoreColor({row: row, col: col, color: Score.COLOR_GREEN});
      score.add(Score.COLOR_GREEN, 1);
      return true;
    }

    return false;
  };

  var releaseColorAnimation = function(ctrl, row, col) {
    return ctrl.tile().releaseColor(row, col);
  };

  var fixJointedPanel = function(ctrl, row0, col0, row1, col1) {
    var tile = ctrl.tile();
    var score = ctrl.score();
    var jointedPanel = tile.panel(row1, col1);

    if (!jointedPanel || !tile.isJointed(row0, col0, row1, col1))
      return false;

    if (jointedPanel.color() === Panel.COLOR_BROWN)
      return false;

    if (!tile.canFix(row1, col1) || jointedPanel.isFixed())
      return false;

    if (jointedPanel.color() === Panel.COLOR_GRAY) {
      tile.panel(row1, col1, null);
      ctrl.pushScoreColor({row: row0, col: col0, color: app.Score.COLOR_RED});
      score.add(Score.COLOR_RED, 1);
    } else {
      tile.fix(row1, col1);
      ctrl.pushScoreColor({row: row1, col: col1, color: app.Score.COLOR_GREEN});
      score.add(Score.COLOR_GREEN, 1);
    }

    return true;
  };

  var fixJointedPanelAnimation = function(ctrl, row, col) {
    ctrl.clearScoreColors();

    var isFixed = false;

    // top
    isFixed = fixJointedPanel(ctrl, row, col, row - 1, col) || isFixed;
    // right
    isFixed = fixJointedPanel(ctrl, row, col, row, col + 1) || isFixed;
    // bottom
    isFixed = fixJointedPanel(ctrl, row, col, row + 1, col) || isFixed;
    // left
    isFixed = fixJointedPanel(ctrl, row, col, row, col - 1) || isFixed;

    return isFixed;
  };

  var chainAnimation = function(ctrl, row, col, animations) {
    var tile = ctrl.tile();
    var score = ctrl.score();
    var chainList = tile.calcChain(row, col);

    if (chainList.length < 2)
      return false;

    for (var li = 0, llen = chainList.length; li < llen; li++) {
      var chains = chainList[li];
      var chainAnimation = (function(chains) {
        return function() {
          for (var ci = 0, clen = chains.length; ci < clen; ci++) {
            var chain = chains[ci];
            ctrl.pushScoreColor({
              row: chain.row,
              col: chain.col,
              color: Score.COLOR_YELLOW
            });
            score.add(Score.COLOR_YELLOW, 1);
          }
          return true;
        };
      }(chains));
      animations.push(chainAnimation);
    }
    return true;
  };

  app.ScoreAnimationController = ScoreAnimationController;
  global.app = app;
}(this));