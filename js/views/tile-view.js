(function(global) {
  'use strict';
  var app = global.app || {};
  var m = global.m || require('mithril');

  var tileView = function(ctrl) {
    var panels = ctrl.panels();
    var panelWidth = ctrl.panelWidth();
    var rowLength = ctrl.rowLength();
    var colLength = ctrl.colLength();

    return [
      m('g.tile', [
        m('rect.back', {
          x: -(panelWidth * colLength / 2),
          y: -(panelWidth * rowLength / 2),
          width: panelWidth * colLength,
          height: panelWidth * rowLength
        }),
        m('g', panels.map(function(cols, ri) {
          return cols.map(function(panel, ci) {
            return app.view.panel({
              panel: panel,
              x: -(panelWidth * colLength / 2) + ci * panelWidth + panelWidth / 2,
              y: -(panelWidth * rowLength / 2) + ri * panelWidth + panelWidth / 2,
              width: panelWidth
            });
          });
        }))
      ])
    ];
  };

  app.tileView = tileView;
  global.app = app;
}(this));