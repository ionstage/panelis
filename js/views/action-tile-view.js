(function(global) {
  'use strict';
  var app = global.app || {};
  var m = global.m || require('mithril');
  var util = global.util || require('../util.js');

  var tileView = app.tileView;

  var supportsTouch = util.supportsTouch;
  var supportsTransitionEnd = util.supportsTransitionEnd;
  var addClass = util.addClass;
  var replaceClass = util.replaceClass;
  var $globalToLocal = util.$globalToLocal;
  var $createPanelView = util.$createPanelView;

  var actionTileView = function(ctrl) {
    var selectedPanel = ctrl.selectedPanel();
    var selectedPosition = ctrl.selectedPosition();

    var view = [];
    var panelElement = m.prop(null);

    if (selectedPanel && selectedPosition) {
      view.push(selectedPanelView(ctrl, function(event) {
        panelElement(event.element);
      }));
    }

    view.push(hitAreaView(ctrl, panelElement));

    return [
      tileView(ctrl),
      m('g.action-tile', view)
    ];
  };

  var selectedPanelView = function(ctrl, oninitialize) {
    var selectedPanel = ctrl.selectedPanel();
    var selectedPosition = ctrl.selectedPosition();
    var panelWidth = ctrl.panelWidth();
    var rowLength = ctrl.rowLength();
    var colLength = ctrl.colLength();

    var x = (selectedPosition.col - colLength / 2) * panelWidth + panelWidth / 2;
    var y = (selectedPosition.row - rowLength / 2) * panelWidth + panelWidth / 2;

    return m('g', {
      transform: 'translate(' + x + ' ' + y +  ')',
      config: function(element, isInitialized) {
        if (isInitialized)
          return;

        var panelElement = element.childNodes[0];
        addClass(panelElement, 'stop');
        panelElement.addEventListener('transitionend', function() {
          rotationEndPanel(ctrl, panelElement);
        });

        oninitialize({element: panelElement});
      }
    }, [
      $createPanelView({
        panel: selectedPanel,
        x: 0,
        y: 0,
        width: panelWidth
      })
    ]);
  };

  var hitAreaView = function(ctrl, panelElementProp) {
    var selectedPanel = ctrl.selectedPanel();
    var selectedPosition = ctrl.selectedPosition();
    var panelWidth = ctrl.panelWidth();
    var rowLength = ctrl.rowLength();
    var colLength = ctrl.colLength();

    return m('rect.hitarea', {
      x: -(panelWidth * colLength / 2),
      y: -(panelWidth * rowLength / 2),
      width: panelWidth * colLength,
      height: panelWidth * rowLength,
      startHandler: function(event) {
        var x = event.clientX || event.touches[0].clientX;
        var y = event.clientY || event.touches[0].clientY;

        if (selectedPanel && selectedPosition)
          rotatePanel(ctrl, panelElementProp());
        else
          selectPanel(ctrl, x, y);
      },
      config: function(element, isInitialized) {
        if (isInitialized)
          return;
        var eventName = supportsTouch ? 'touchstart' : 'mousedown';
        element.addEventListener(eventName, this.attrs.startHandler);
      }
    });
  };

  var rotatePanel = function(ctrl, panelElement) {
    if (supportsTransitionEnd)
      replaceClass(panelElement, 'stop', 'rotate');
    else
      rotationEndPanel(ctrl, panelElement);
  };

  var rotationEndPanel = function(ctrl, panelElement) {
    ctrl.dispatchEvent({
      type: 'rotationend'
    });
    replaceClass(panelElement, 'rotate', 'stop');
  };

  var selectPanel = function(ctrl, x, y) {
    var panelWidth = ctrl.panelWidth();
    var rowLength = ctrl.rowLength();
    var colLength = ctrl.colLength();

    var loc = $globalToLocal({x: x, y: y});
    var row = parseInt((loc.y + panelWidth * rowLength / 2) / panelWidth, 10);
    var col = parseInt((loc.x + panelWidth * colLength / 2) / panelWidth, 10);

    ctrl.dispatchEvent({
      type: 'select',
      row: row,
      col: col
    });
  };

  app.actionTileView = actionTileView;
  global.app = app;
}(this));