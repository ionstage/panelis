(function(global) {
  'use strict';
  var m = global.m;
  var app = global.app || {};

  var panelWidth = 72;

  app.tileView = function(ctrl) {
    return [
      m('g.tile', [
        m('rect.base', {
          x: -(panelWidth * 4),
          y: -(panelWidth * 4),
          width: panelWidth * 8,
          height: panelWidth * 8
        }),
        m('g', ctrl.panels.map(function(cols, ri) {
          return cols.map(function(panel, ci) {
            return app.panelView({
              panel: panel,
              x: -(panelWidth * 4) + ci * panelWidth + panelWidth / 2, 
              y: -(panelWidth * 4) + ri * panelWidth + panelWidth / 2,
              width: panelWidth
            });
          });
        }))
      ])
    ];
  };

  global.app = app;
}(this));