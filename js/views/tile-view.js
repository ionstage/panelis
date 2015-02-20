(function(global) {
  'use strict';
  var app = global.app || {};
  var m = global.m || require('mithril');

  var panelWidth = 72;

  var tileView = function(ctrl) {
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

  app.tileView = tileView;
  global.app = app;
}(this));