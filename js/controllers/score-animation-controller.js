(function(global) {
  'use strict';
  var app = global.app || {};
  var m = global.m || require('mithril');

  var Panel = app.Panel;
  var Score = app.Score;

  var COLOR_BROWN = Panel.COLOR_BROWN;
  var COLOR_GRAY = Panel.COLOR_GRAY;

  var fixJointedPanel = function(row0, col0, row1, col1, score) {
    var tile = this.tile;
    var scoreColors = this.scoreColors;
    var jointedPanel = tile.panel(row1, col1);

    if (!jointedPanel || !tile.isJointed(row0, col0, row1, col1))
      return;

    if (jointedPanel.color() === COLOR_BROWN)
      return;

    if (!tile.canFix(row1, col1) || jointedPanel.isFixed())
      return;

    if (jointedPanel.color() === COLOR_GRAY) {
      tile.panel(row1, col1, null);
      scoreColors.push({row: row0, col: col0, color: app.Score.COLOR_RED});
      score.add(Score.COLOR_RED, 1);
    } else {
      tile.fix(row1, col1);
      scoreColors.push({row: row1, col: col1, color: app.Score.COLOR_GREEN});
      score.add(Score.COLOR_GREEN, 1);
    }
  };

  var ScoreAnimationController = function(option) {
    this.scoreColors = option.scoreColors;
    this.tile = option.tile;
    this.panelWidth = m.prop(option.panelWidth || 72);
  };

  ScoreAnimationController.prototype.start = function(row, col, score, callback) {
    var ctrl = this;
    var tile = ctrl.tile;
    var startPanel = tile.panel(row, col);

    if (!startPanel) {
      callback();
      return;
    }

    m.redraw.strategy('none');
    ctrl.scoreColors = [];

    var animations = [
      function() {
        var canFix = tile.canFix(row, col);
        if (canFix){
          tile.fix(row, col);
          ctrl.scoreColors.push({row: row, col: col, color: Score.COLOR_GREEN});
          score.add(Score.COLOR_GREEN, 1);
          m.redraw(true);
          ctrl.scoreColors = [];
        }
        return canFix;
      },
      function() {
        return tile.releaseColor(row, col);
      },
      function() {
        ctrl.scoreColors = [];

        // top
        fixJointedPanel.call(ctrl, row, col, row - 1, col, score);
        // right
        fixJointedPanel.call(ctrl, row, col, row, col + 1, score);
        // bottom
        fixJointedPanel.call(ctrl, row, col, row + 1, col, score);
        // left
        fixJointedPanel.call(ctrl, row, col, row, col - 1, score);

        var isFixed = ctrl.scoreColors.length > 0;
        m.redraw(true);
        ctrl.scoreColors = [];
        return isFixed;
      },
      function() {
        var chainList = tile.calcChain(row, col);

        if (chainList.length < 2)
          return false;

        for (var li = 0, llen = chainList.length; li < llen; li++) {
          var chains = chainList[li];
          var chainAnimation = (function(chains) {
            return function() {
              ctrl.scoreColors = [];
              for (var ci = 0, clen = chains.length; ci < clen; ci++) {
                var chain = chains[ci];
                ctrl.scoreColors.push({row: chain.row, col: chain.col, color: Score.COLOR_YELLOW});
                score.add(Score.COLOR_YELLOW, 1);
              }
              m.redraw(true);
              ctrl.scoreColors = [];
              return true;
            };
          }(chains));
          animations.push(chainAnimation);
        }
        return true;
      }
    ];

    setTimeout(function() {
      (function animate(index) {
        var animation = animations[index];
        if (!animation) {
          setTimeout(function() {
            callback();
          }, 250);
          return;
        }

        m.startComputation();
        var wait = animation();
        if (wait) {
          setTimeout(function() {
            m.endComputation();
            animate(index + 1);
          }, 500);
        } else {
          m.endComputation();
          animate(index + 1);
        }
      }(0));
    }, tile.canFix(row, col) ? 500 : 0);
  };

  app.ScoreAnimationController = ScoreAnimationController;
  global.app = app;
}(this));