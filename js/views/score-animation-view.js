(function(global) {
  'use strict';
  var app = global.app || {};
  var m = global.m || require('mithril');

  var scoreAnimationView = function(ctrl) {
    var panelWidth = ctrl.panelWidth();

    var view = [];
    var scoreColors = ctrl.scoreColors || [];

    for (var ci = 0, clen = scoreColors.length; ci < clen; ci++) {
      var scoreColor = scoreColors[ci];
      view.push(m('circle.circle', {
        className: scoreColor.color + (app.view.supportsTransitionEnd ? ' animation' : ''),
        cx: (scoreColor.col - 4) * panelWidth + panelWidth / 2,
        cy: (scoreColor.row - 4) * panelWidth + panelWidth / 2,
        r: panelWidth / 3.2
      }));
    };

    return m('g.score-animation', view);
  };

  app.scoreAnimationView = scoreAnimationView;
  global.app = app;
}(this));