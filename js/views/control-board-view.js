(function(global) {
  'use strict';
  var app = global.app || {};
  var m = global.m || require('mithril');

  var Panel = app.Panel;

  var controlBoardView = function(ctrl) {
    var color = ctrl.color();
    var active = ctrl.active();
    var panels = ctrl.panels();
    var selectedIndex = ctrl.selectedIndex();
    var score = ctrl.score();
    var panelWidth = ctrl.panelWidth();

    var view = [];

    var className = '';
    var dx = 0;
    var dy = 0;
    if (color === Panel.COLOR_WHITE) {
      dx = -384;
      dy = 0;
      className = 'white';
    } else if (color === Panel.COLOR_BLACK) {
      dx = 384;
      dy = 0;
      className = 'black';
    }

    if (active) {
      view.push(m('rect.active', {
        x: -84 + dx,
        y: -312 + dy,
        width: 168,
        height: 24
      }));
    }

    view.push(m('rect.back', {
      x: -84 + dx,
      y: -288 + dy,
      width: 168,
      height: 576
    }));

    view.push(m('g.button', [
      m('rect.rect.back', {
        x: -60 + dx,
        y: -264 + dy,
        width: 120,
        height: 42,
        onclick: function() {
          ctrl.dispatchEvent({type: 'ok'});
        }
      }),
      m('text.text.ok', {
        x: dx,
        y: -235 + dy
      }, 'O K')
    ]));

    view.push(m('g.button', [
      m('rect.rect.back', {
        x: -60 + dx,
        y: -198 + dy,
        width: 120,
        height: 42,
        onclick: function() {
          ctrl.dispatchEvent({type: 'back'});
        }
      }),
      m('text.text.back', {
        x: dx,
        y: -171 + dy
      }, 'Back')
    ]));

    var panelViews = [null, null, null];
    var panelHitAreaViews = [null, null, null];
    for (var pi = 0; pi < 3; pi++) {
      var panel = panels[pi];
      var isSelected = selectedIndex === pi;
      if (panel) {
        panelViews[pi] = m('g',
          {className: isSelected ? 'selected' : ''},
          [
            app.view.panel({
              panel: panel,
              x: -36 + dx + panelWidth / 2,
              y: -120 + 84 * pi + panelWidth / 2,
              width: panelWidth
            })
          ]);
        var hitAreaAttr = {
          x: -36 + dx,
          y: -120 + 84 * pi,
          width: panelWidth,
          height: panelWidth,
          index: pi,
          selectHandler: (function(index) {
            return function() {
              ctrl.dispatchEvent({
                type: 'select',
                index: index
              });
              m.redraw(true);
            };
          }(pi)),
          config: function(element, isInitialized) {
            if (isInitialized)
              return;
            var eventName = app.view.supportsTouch ? 'touchstart' : 'mousedown';
            element.addEventListener(eventName, this.attrs.selectHandler);
          }
        };
        panelHitAreaViews[pi] = m('rect.hitarea', hitAreaAttr);
      }
    }

    view.push(m('g.slot', [
      m('rect.back', {
        x: -48 + dx,
        y: -132 + dy,
        width: 96,
        height: 264
      }),
      m('g', panelViews),
      m('g', panelHitAreaViews)
    ]));

    view.push(m('g.score',[
      m('g.red', [
        m('circle.circle', {
          cx: -36 + dx,
          cy: 180 + dy,
          r: 12
        }),
        m('text.text', {
          x: -10 + dx,
          y: 190 - 3 + dy
        }, '×'),
        m('text.text', {
          x: 16 + dx,
          y: 190 - 3 + dy
        }, score.red())
      ]),
      m('g.yellow', [
        m('circle.circle', {
          cx: -36 + dx,
          cy: 214 + dy,
          r: 12
        }),
        m('text.text', {
          x: -10 + dx,
          y: 224 - 3 + dy
        }, '×'),
        m('text.text', {
          x: 16 + dx,
          y: 224 - 3 + dy
        }, score.yellow())
      ]),
      m('g.green', [
        m('circle.circle', {
          cx: -36 + dx,
          cy: 248 + dy,
          r: 12
        }),
        m('text.text', {
          x: -10 + dx,
          y: 258 - 3 + dy
        }, '×'),
        m('text.text', {
          x: 16 + dx,
          y: 258 - 3 + dy
        }, score.green())
      ])
    ]));

    return m('g.control-board', {className: className}, view);
  };

  app.controlBoardView = controlBoardView;
  global.app = app;
}(this));