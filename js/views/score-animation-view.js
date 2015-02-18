(function(global) {
  'use strict';
  var m = global.m;
  var app = global.app || {};

  var panelWidth = 72;

  app.scoreAnimationView = function(ctrl) {
    var view = [];
    var scoreColors = ctrl.scoreColors || [];

    for (var ci = 0, clen = scoreColors.length; ci < clen; ci++) {
      var scoreColor = scoreColors[ci];
      view.push(m('circle.circle', {
        className: scoreColor.color + (app.supportsTransitionEnd ? ' animation' : ''),
        cx: (scoreColor.col - 4) * panelWidth + panelWidth / 2,
        cy: (scoreColor.row - 4) * panelWidth + panelWidth / 2,
        r: panelWidth / 3.2
      }));
    };

    return m('g.score-animation', view);
  };

  global.app = app;
}(this));