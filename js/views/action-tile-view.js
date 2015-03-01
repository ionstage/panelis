(function(global) {
  'use strict';
  var app = global.app || {};
  var m = global.m || require('mithril');

  var tileView = app.tileView;

  var addClass = function(el, className) {
    el.setAttribute('class', el.getAttribute('class') + ' ' + className);
  };

  var replaceClass = function(el, c0, c1) {
    var className = el.getAttribute('class').replace(c0, c1);
    el.setAttribute('class',  className);
  };

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
    var tile = ctrl.tile();
    var selectedPanel = ctrl.selectedPanel();
    var selectedPosition = ctrl.selectedPosition();
    var panelWidth = ctrl.panelWidth();

    var rowLength = tile.rowLength();
    var colLength = tile.colLength();

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
      app.view.panel({
        panel: selectedPanel,
        x: 0,
        y: 0,
        width: panelWidth
      })
    ]);
  };

  var hitAreaView = function(ctrl, panelElementProp) {
    var tile = ctrl.tile();
    var selectedPanel = ctrl.selectedPanel();
    var selectedPosition = ctrl.selectedPosition();
    var panelWidth = ctrl.panelWidth();

    var rowLength = tile.rowLength();
    var colLength = tile.colLength();

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
        var eventName = app.view.supportsTouch ? 'touchstart' : 'mousedown';
        element.addEventListener(eventName, this.attrs.startHandler);
      }
    });
  };

  var rotatePanel = function(ctrl, panelElement) {
    if (app.view.supportsTransitionEnd)
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
    var tile = ctrl.tile();
    var panelWidth = ctrl.panelWidth();

    var rowLength = tile.rowLength();
    var colLength = tile.colLength();
    var loc = app.view.globalToLocal({x: x, y: y});
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