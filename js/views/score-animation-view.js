(function(global) {
  'use strict';
  var app = global.app || {};
  var m = global.m || require('mithril');

  var scoreAnimationView = function(ctrl) {
    var scoreColors = ctrl.scoreColors();
    var panelWidth = ctrl.panelWidth();
    var rowLength = ctrl.rowLength();
    var colLength = ctrl.colLength();

    var view = [];

    for (var ci = 0, clen = scoreColors.length; ci < clen; ci++) {
      var scoreColor = scoreColors[ci];
      view.push(m('circle.circle', {
        className: scoreColor.color + (app.view.supportsTransitionEnd ? ' animation' : ''),
        cx: (scoreColor.col - colLength / 2) * panelWidth + panelWidth / 2,
        cy: (scoreColor.row - rowLength / 2) * panelWidth + panelWidth / 2,
        r: panelWidth / 3.2
      }));
    };

    return m('g.score-animation', view);
  };

  app.scoreAnimationView = scoreAnimationView;
  global.app = app;
}(this));