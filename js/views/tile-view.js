(function(app) {
  'use strict';
  var m = require('mithril');
  var util = app.util || require('../util.js');

  var tileView = function(ctrl) {
    var panelWidth = ctrl.panelWidth();
    var scoreColors = ctrl.scoreColors();
    var rowLength = ctrl.rowLength();
    var colLength = ctrl.colLength();

    return m('g.tile', [
      m('rect.back', {
        x: -(panelWidth * colLength / 2),
        y: -(panelWidth * rowLength / 2),
        width: panelWidth * colLength,
        height: panelWidth * rowLength
      }),
      m('g', ctrl.panels().map(function(cols, ri) {
        return cols.map(function(panel, ci) {
          return app.createPanelView({
            panel: panel,
            x: -(panelWidth * colLength / 2) + ci * panelWidth + panelWidth / 2,
            y: -(panelWidth * rowLength / 2) + ri * panelWidth + panelWidth / 2,
            width: panelWidth
          });
        });
      })),
      m('g.score-animation', scoreColors.map(function(scoreColor) {
        return m('circle.circle', {
          className: scoreColor.color + (util.supportsTransitionEnd() ? ' animation' : ''),
          cx: (scoreColor.col - colLength / 2) * panelWidth + panelWidth / 2,
          cy: (scoreColor.row - rowLength / 2) * panelWidth + panelWidth / 2,
          r: panelWidth / 3.2
        });
      }))
    ]);
  };

  if (typeof module !== 'undefined' && module.exports)
    module.exports = tileView;
  else
    app.tileView = tileView;
})(this.app || (this.app = {}));