(function(app) {
  'use strict';
  var m = require('mithril');
  var util = app.util || require('../util.js');
  var tileView = app.tileView || require('./tile-view.js');

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
        util.addClass(panelElement, 'stop');
        panelElement.addEventListener('transitionend', function() {
          rotationEndPanel(ctrl, panelElement);
        });

        oninitialize({element: panelElement});
      }
    }, [
      app.createPanelView({
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
        var eventName = util.supportsTouch() ? 'touchstart' : 'mousedown';
        element.addEventListener(eventName, this.attrs.startHandler);
      }
    });
  };

  var rotatePanel = function(ctrl, panelElement) {
    if (util.supportsTransitionEnd())
      util.replaceClass(panelElement, 'stop', 'rotate');
    else
      rotationEndPanel(ctrl, panelElement);
  };

  var rotationEndPanel = function(ctrl, panelElement) {
    ctrl.dispatchEvent({
      type: 'rotationend'
    });
    util.replaceClass(panelElement, 'rotate', 'stop');
  };

  var selectPanel = function(ctrl, x, y) {
    var panelWidth = ctrl.panelWidth();
    var rowLength = ctrl.rowLength();
    var colLength = ctrl.colLength();

    var loc = app.globalToLocal({x: x, y: y});
    var row = parseInt((loc.y + panelWidth * rowLength / 2) / panelWidth, 10);
    var col = parseInt((loc.x + panelWidth * colLength / 2) / panelWidth, 10);

    ctrl.dispatchEvent({
      type: 'select',
      row: row,
      col: col
    });
  };

  if (typeof module !== 'undefined' && module.exports)
    module.exports = actionTileView;
  else
    app.actionTileView = actionTileView;
})(this.app || (this.app = {}));