(function(global) {
  'use strict';
  var app = global.app || {};
  var m = global.m || require('mithril');

  var Panel = app.Panel;

  var controlBoardView = function(ctrl) {
    var panelWidth = ctrl.panelWidth();

    var view = [];

    var color = ctrl.color();
    var className = '';
    var transform = '';
    if (color === Panel.COLOR_WHITE) {
      className = 'white';
      transform = 'translate(-384 0)';
    } else if (color === Panel.COLOR_BLACK) {
      className = 'black';
      transform = 'translate(384 0)';
    }

    var active = ctrl.active();
    if (active) {
      view.push(m('rect.active', {
        x: -84,
        y: -312,
        width: 168,
        height: 24
      }));
    }

    view.push(m('rect.back', {
      x: -84,
      y: -288,
      width: 168,
      height: 576
    }));

    view.push(m('g.button', [
      m('rect.rect.back', {
        x: -60,
        y: -264,
        width: 120,
        height: 42,
        onclick: function() {
          ctrl.dispatchEvent({type: 'ok'});
        }
      }),
      m('text.text.ok', {
        x: 0,
        y: -235
      }, 'O K')
    ]));

    view.push(m('g.button', [
      m('rect.rect.back', {
        x: -60,
        y: -198,
        width: 120,
        height: 42,
        onclick: function() {
          ctrl.dispatchEvent({type: 'back'});
        }
      }),
      m('text.text.back', {
        x: 0,
        y: -171
      }, 'Back')
    ]));

    var panels = ctrl.panels;
    var panelViews = [null, null, null];
    var panelHitAreaViews = [null, null, null];
    for (var pi = 0; pi < 3; pi++) {
      var panel = panels[pi];
      var isSelected = ctrl.selectedIndex() === pi;
      if (panel) {
        panelViews[pi] = m('g',
          {className: isSelected ? 'selected' : ''},
          [
            app.panelView({
              panel: panel,
              x: -36 + panelWidth / 2, 
              y: -120 + 84 * pi + panelWidth / 2,
              width: panelWidth
            })
          ]);
        var hitAreaAttr = {
          x: -36, 
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
            var eventName = app.supportsTouch ? 'touchstart' : 'mousedown';
            element.addEventListener(eventName, this.attrs.selectHandler);
          }
        };
        panelHitAreaViews[pi] = m('rect.hitarea', hitAreaAttr);
      }
    }

    view.push(m('g.slot', [
      m('rect.back', {
        x: -48,
        y: -132,
        width: 96,
        height: 264
      }),
      m('g', panelViews),
      m('g', panelHitAreaViews)
    ]));

    view.push(m('g.score',[
      m('g.red', [
        m('circle.circle', {
          cx: -36,
          cy: 180,
          r: 12
        }),
        m('text.text', {
          x: -10,
          y: 190 - 3
        }, '×'),
        m('text.text', {
          x: 16,
          y: 190 - 3
        }, ctrl.score.red())
      ]),
      m('g.yellow', [
        m('circle.circle', {
          cx: -36,
          cy: 214,
          r: 12
        }),
        m('text.text', {
          x: -10,
          y: 224 - 3
        }, '×'),
        m('text.text', {
          x: 16,
          y: 224 - 3
        }, ctrl.score.yellow())
      ]),
      m('g.green', [
        m('circle.circle', {
          cx: -36,
          cy: 248,
          r: 12
        }),
        m('text.text', {
          x: -10,
          y: 258 - 3
        }, '×'),
        m('text.text', {
          x: 16,
          y: 258 - 3
        }, ctrl.score.green())
      ])
    ]));

    return m('g.control-board', {
      className: className,
      transform: transform
    }, view);
  };

  app.controlBoardView = controlBoardView;
  global.app = app;
}(this));