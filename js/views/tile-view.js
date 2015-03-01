(function(global) {
  'use strict';
  var app = global.app || {};
  var m = global.m || require('mithril');

  var tileView = function(ctrl) {
    var tile = ctrl.tile();
    var panelWidth = ctrl.panelWidth();
    var scoreColors = ctrl.scoreColors();

    var rowLength = tile.rowLength();
    var colLength = tile.colLength();

    return [
      m('g.tile', [
        m('rect.back', {
          x: -(panelWidth * colLength / 2),
          y: -(panelWidth * rowLength / 2),
          width: panelWidth * colLength,
          height: panelWidth * rowLength
        }),
        m('g', tile.panels().map(function(cols, ri) {
          return cols.map(function(panel, ci) {
            return app.createPanelView({
              panel: panel,
              x: -(panelWidth * colLength / 2) + ci * panelWidth + panelWidth / 2,
              y: -(panelWidth * rowLength / 2) + ri * panelWidth + panelWidth / 2,
              width: panelWidth
            });
          });
        }))
      ]),
      m('g.score-animation', scoreColors.map(function(scoreColor) {
        return m('circle.circle', {
          className: scoreColor.color + (app.supportsTransitionEnd ? ' animation' : ''),
          cx: (scoreColor.col - colLength / 2) * panelWidth + panelWidth / 2,
          cy: (scoreColor.row - rowLength / 2) * panelWidth + panelWidth / 2,
          r: panelWidth / 3.2
        });
      }))
    ];
  };

  app.tileView = tileView;
  global.app = app;
}(this));