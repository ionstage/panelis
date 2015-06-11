(function(app) {
  'use strict';
  var m = require('mithril');
  var util = app.util || require('../util.js');
  var Panel = app.Panel || require('../models/panel.js');
  var ControlBoardController = app.ControlBoardController || require('../controllers/control-board-controller.js');

  var controlBoardView = function(ctrl) {
    var color = ctrl.color();
    var active = ctrl.active();
    var panels = ctrl.panels();
    var selectedIndex = ctrl.selectedIndex();
    var score = ctrl.score();
    var panelWidth = ctrl.panelWidth();
    var layout = ctrl.layout();

    var view = [];

    var className = '';
    var dx = 0;
    var dy = 0;

    if (color === Panel.COLOR_WHITE) {
      if (layout === ControlBoardController.LAYOUT_VERTICAL)
        dx = -384;
      else
        dy = 378;
      className = 'white';
    } else if (color === Panel.COLOR_BLACK) {
      if (layout === ControlBoardController.LAYOUT_VERTICAL)
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

    if (layout === ControlBoardController.LAYOUT_VERTICAL) {
      if (active)
        view.push(activeView(-84 + dx, -312 + dy, 168, 24));
      view.push(backView(-84 + dx, -288 + dy, 168, 576));
      view.push(m('g', okButtonView(-60 + dx, -264 + dy, 120, 42, onClickOkButton)));
      view.push(m('g', backButtonView(-60 + dx, -198 + dy, 120, 42, onClickBackButton)));
      view.push(slotView(panels, selectedIndex, panelWidth, -48 + dx, -132 + dy, layout, onSelectSlot));
      view.push(m('g', scoreView(score, -36 + dx, 180 + dy)));
    } else if (layout === ControlBoardController.LAYOUT_HORIZONTAL_INVERSE) {
      if (active)
        view.push(activeView(288 + dx, -78 + dy, 24, 156));
      view.push(backView(-288 + dx, -78 + dy, 576, 156));
      view.push(m('g.inverse', okButtonView(150 + dx, -54 + dy, 120, 42, onClickOkButton)));
      view.push(m('g.inverse', backButtonView(150 + dx, 12 + dy, 120, 42, onClickBackButton)));
      view.push(slotView(panels, selectedIndex, panelWidth, -132 + dx, -48 + dy, layout, onSelectSlot));
      view.push(m('g.inverse', scoreView(score, 180 + dx, -36 + dy)));
    } else {
      if (active)
        view.push(activeView(-312 + dx, -78 + dy, 24, 156));
      view.push(backView(-288 + dx, -78 + dy, 576, 156));
      view.push(m('g', okButtonView(-270 + dx, -54 + dy, 120, 42, onClickOkButton)));
      view.push(m('g', backButtonView(-270 + dx, 12 + dy, 120, 42, onClickBackButton)));
      view.push(slotView(panels, selectedIndex, panelWidth, -132 + dx, -48 + dy, layout, onSelectSlot));
      view.push(m('g', scoreView(score, 180 + dx, -36 + dy)));
    }

    return m('g.control-board', {
      className: className,
      config: function(element, isInitialized, context) {
        var currentLayout = ctrl.layout();
        if (currentLayout !== context.layout) {
          ctrl.dispatchEvent({
            type: 'layoutchange'
          });
          context.layout = currentLayout;
        }
      }
    }, view);
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

  var slotView = function(panels, selectedIndex, panelWidth, x, y, layout, onselect) {
    var panelViews = slotPanelViews(panels, selectedIndex, panelWidth, x, y, layout);
    var panelHitAreaViews = slotPanelHitAreaViews(panels, panelWidth, x, y, layout, onselect);

    var width, height;

    if (layout === ControlBoardController.LAYOUT_VERTICAL) {
      width = panelWidth + 24;
      height = (panelWidth + 12) * panels.length + 12;
    } else {
      width = (panelWidth + 12) * panels.length + 12;
      height = panelWidth + 24;
    }

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

  var slotPanelViews = function(panels, selectedIndex, panelWidth, x, y, layout) {
    return panels.map(function(panel, index) {
      if (!panels)
        return null;

      var point = {};
      var isSelected = selectedIndex === index;

      if (layout === ControlBoardController.LAYOUT_VERTICAL) {
        point.x = x + 12 + panelWidth / 2;
        point.y = y + 12 + (panelWidth + 12) * index + panelWidth / 2;
      } else if (layout === ControlBoardController.LAYOUT_HORIZONTAL) {
        point.x = x + 12 + (panelWidth + 12) * index + panelWidth / 2;
        point.y = y + 12 + panelWidth / 2;
      } else if (layout === ControlBoardController.LAYOUT_HORIZONTAL_INVERSE) {
        point.x = x + 12 + (panelWidth + 12) * (panels.length - index - 1) + panelWidth / 2;
        point.y = y + 12 + panelWidth / 2;
      }

      return m('g', {className: isSelected ? 'selected' : ''}, [
        util.$createPanelView({
          panel: panel,
          x: point.x,
          y: point.y,
          width: panelWidth
        })
      ]);
    });
  };

  var slotPanelHitAreaViews = function(panels, panelWidth, x, y, layout, onselect) {
    return panels.map(function(panel, index) {
      if (!panels)
        return null;

      var point = {};

      if (layout === ControlBoardController.LAYOUT_VERTICAL) {
        point.x = x + 12;
        point.y = y + 12 + (panelWidth + 12) * index;
      } else if (layout === ControlBoardController.LAYOUT_HORIZONTAL) {
        point.x = x + 12 + (panelWidth + 12) * index;
        point.y = y + 12;
      } else if (layout === ControlBoardController.LAYOUT_HORIZONTAL_INVERSE) {
        point.x = x + 12 + (panelWidth + 12) * (panels.length - index - 1);
        point.y = y + 12;
      }

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
          var eventName = util.supportsTouch() ? 'touchstart' : 'mousedown';
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

  if (typeof module !== 'undefined' && module.exports)
    module.exports = controlBoardView;
  else
    app.controlBoardView = controlBoardView;
})(this.app || (this.app = {}));