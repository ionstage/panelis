(function(global) {
  'use strict';
  var app = global.app || {};
  var m = global.m;
  var util = global.util;

  var Panel = app.Panel;

  var supportsTouch = util.supportsTouch;
  var windowAspectRatio = util.windowAspectRatio;
  var $createPanelView = util.$createPanelView;

  var controlBoardView = function(ctrl) {
    var color = ctrl.color();
    var active = ctrl.active();
    var panels = ctrl.panels();
    var selectedIndex = ctrl.selectedIndex();
    var score = ctrl.score();
    var panelWidth = ctrl.panelWidth();

    var view = [];

    var isLandscape = windowAspectRatio() >= 1.0;
    var className = '';
    var dx = 0;
    var dy = 0;

    if (color === Panel.COLOR_WHITE) {
      if (isLandscape)
        dx = -384;
      else
        dy = 378;
      className = 'white';
    } else if (color === Panel.COLOR_BLACK) {
      if (isLandscape)
        dx = 384;
      else
        dy = -378;
      className = 'black';
    }

    var onClickOkButton = function() {
      ctrl.dispatchEvent({type: 'ok'});
    };

    var onClickBackButton = function() {
      ctrl.dispatchEvent({type: 'back'});
    };

    var onSelectSlot = function(event) {
      ctrl.dispatchEvent({
        type: 'select',
        selectedIndex: event.selectedIndex
      });
    };

    if (isLandscape) {
      if (active)
        view.push(activeView(-84 + dx, -312 + dy, 168, 24));
      view.push(backView(-84 + dx, -288 + dy, 168, 576));
      view.push(okButtonView(-60 + dx, -264 + dy, 120, 42, onClickOkButton));
      view.push(backButtonView(-60 + dx, -198 + dy, 120, 42, onClickBackButton));
      view.push(slotView(panels, selectedIndex, panelWidth, -48 + dx, -132 + dy, isLandscape, onSelectSlot));
      view.push(scoreView(score, -36 + dx, 180 + dy));
    } else {
      if (active)
        view.push(activeView(-312 + dx, -78 + dy, 24, 156));
      view.push(backView(-288 + dx, -78 + dy, 576, 156));
      view.push(okButtonView(-270 + dx, -54 + dy, 120, 42, onClickOkButton));
      view.push(backButtonView(-270 + dx, 12 + dy, 120, 42, onClickBackButton));
      view.push(slotView(panels, selectedIndex, panelWidth, -132 + dx, -48 + dy, isLandscape, onSelectSlot));
      view.push(scoreView(score, 180 + dx, -36 + dy));
    }

    return m('g.control-board', {className: className}, view);
  };

  var activeView = function(x, y, width, height) {
    return m('rect.active', {
      x: x,
      y: y,
      width: width,
      height: height
    });
  };

  var backView = function(x, y, width, height) {
    return m('rect.back', {
      x: x,
      y: y,
      width: width,
      height: height
    });
  };

  var okButtonView = function(x, y, width, height, onclick) {
    return m('g.button', [
      m('rect.rect.back', {
        x: x,
        y: y,
        width: width,
        height: height,
        onclick: onclick
      }),
      m('text.text.ok', {
        x: x + width / 2,
        y: y + height / 2 + 8
      }, 'O K')
    ]);
  };

  var backButtonView = function(x, y, width, height, onclick) {
    return m('g.button', [
      m('rect.rect.back', {
        x: x,
        y: y,
        width: width,
        height: height,
        onclick: onclick
      }),
      m('text.text.back', {
        x: x + width / 2,
        y: y + height / 2 + 6
      }, 'Back')
    ]);
  };

  var slotView = function(panels, selectedIndex, panelWidth, x, y, isLandscape, onselect) {
    var panelViews = slotPanelViews(panels, selectedIndex, panelWidth, x, y, isLandscape);
    var panelHitAreaViews = slotPanelHitAreaViews(panels, panelWidth, x, y, isLandscape, onselect);

    var width = isLandscape ? panelWidth + 24 : (panelWidth + 12) * panels.length + 12;
    var height = isLandscape ? (panelWidth + 12) * panels.length + 12 : panelWidth + 24;

    return m('g.slot', [
      m('rect.back', {
        x: x,
        y: y,
        width: width,
        height: height
      }),
      m('g', panelViews),
      m('g', panelHitAreaViews)
    ]);
  };

  var slotPanelViews = function(panels, selectedIndex, panelWidth, x, y, isLandscape) {
    return panels.map(function(panel, index) {
      if (!panels)
        return null;

      var isSelected = selectedIndex === index;
      var point = {
        x: isLandscape ? (x + 12 + panelWidth / 2) : (x + 12 + (panelWidth + 12) * index + panelWidth / 2),
        y: isLandscape ? (y + 12 + (panelWidth + 12) * index + panelWidth / 2) : (y + 12 + panelWidth / 2)
      };

      return m('g', {className: isSelected ? 'selected' : ''}, [
        $createPanelView({
          panel: panel,
          x: point.x,
          y: point.y,
          width: panelWidth
        })
      ]);
    });
  };

  var slotPanelHitAreaViews = function(panels, panelWidth, x, y, isLandscape, onselect) {
    return panels.map(function(panel, index) {
      if (!panels)
        return null;

      var point = {
        x: isLandscape ? (x + 12) : (x + 12 + (panelWidth + 12) * index),
        y: isLandscape ? (y + 12 + (panelWidth + 12) * index) : (y + 12)
      };

      var hitAreaAttr = {
        x: point.x,
        y: point.y,
        width: panelWidth,
        height: panelWidth,
        index: index,
        selectHandler: (function(index) {
          return function() {
            onselect({selectedIndex: index});
          };
        }(index)),
        config: function(element, isInitialized) {
          if (isInitialized)
            return;
          var eventName = supportsTouch ? 'touchstart' : 'mousedown';
          element.addEventListener(eventName, this.attrs.selectHandler);
        }
      };

      return m('rect.hitarea', hitAreaAttr);
    });
  };

  var scoreView = function(score, x, y) {
    return m('g.score',[
      m('g.red', [
        m('circle.circle', {
          cx: x,
          cy: y,
          r: 12
        }),
        m('text.text', {
          x: x + 26,
          y: y + 7
        }, '×'),
        m('text.text', {
          x: x + 52,
          y: y + 7
        }, score.red())
      ]),
      m('g.yellow', [
        m('circle.circle', {
          cx: x,
          cy: y + 34,
          r: 12
        }),
        m('text.text', {
          x: x + 26,
          y: y + 41
        }, '×'),
        m('text.text', {
          x: x + 52,
          y: y + 41
        }, score.yellow())
      ]),
      m('g.green', [
        m('circle.circle', {
          cx: x,
          cy: y + 68,
          r: 12
        }),
        m('text.text', {
          x: x + 26,
          y: y + 75
        }, '×'),
        m('text.text', {
          x: x + 52,
          y: y + 75
        }, score.green())
      ])
    ]);
  };

  app.controlBoardView = controlBoardView;
  global.app = app;
}(this));