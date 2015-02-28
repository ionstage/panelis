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
    var tile = ctrl.tile();
    var selectedPanel = ctrl.selectedPanel();
    var selectedPosition = ctrl.selectedPosition();
    var panelWidth = ctrl.panelWidth();

    var rowLength = tile.rowLength();
    var colLength = tile.colLength();

    var view = [];

    var panelElement = null;

    if (selectedPanel && selectedPosition) {
      var x = (selectedPosition.col - colLength / 2) * panelWidth + panelWidth / 2;
      var y = (selectedPosition.row - rowLength / 2) * panelWidth + panelWidth / 2;
      var transform = 'translate(' + x + ' ' + y +  ')';

      view.push(m('g', {
        transform: transform,
        config: function(element, isInitialized) {
          if (isInitialized)
            return;
          panelElement = element.childNodes[0];
          addClass(panelElement, 'stop');

          // rotation end
          panelElement.addEventListener('transitionend', function() {
            ctrl.dispatchEvent({
              type: 'rotationend'
            });
            replaceClass(panelElement, 'rotate', 'stop');
          });
        }
      }, [
        app.view.panel({
          panel: selectedPanel,
          x: 0,
          y: 0,
          width: panelWidth
        })
      ]));
    }

    view.push(m('rect.hitarea', {
      x: -(panelWidth * colLength / 2),
      y: -(panelWidth * rowLength / 2),
      width: panelWidth * colLength,
      height: panelWidth * rowLength,
      startHandler: function(event) {
        // rotate
        if (selectedPanel && selectedPosition) {
          if (app.view.supportsTransitionEnd) {
            replaceClass(panelElement, 'stop', 'rotate');
          } else {
            ctrl.dispatchEvent({
              type: 'rotationend'
            });
            replaceClass(panelElement, 'rotate', 'stop');
          }
          return;
        }

        // select
        var loc = app.view.globalToLocal({
          x: event.clientX || event.touches[0].clientX,
          y: event.clientY || event.touches[0].clientY
        });
        var row = parseInt((loc.y + panelWidth * rowLength / 2) / panelWidth, 10);
        var col = parseInt((loc.x + panelWidth * colLength / 2) / panelWidth, 10);
        ctrl.dispatchEvent({
          type: 'select',
          row: row,
          col: col
        });
      },
      config: function(element, isInitialized) {
        if (isInitialized)
          return;
        var eventName = app.view.supportsTouch ? 'touchstart' : 'mousedown';
        element.addEventListener(eventName, this.attrs.startHandler);
      }
    }));

    return [
      tileView(ctrl),
      m('g.action-tile', view)
    ];
  };

  app.actionTileView = actionTileView;
  global.app = app;
}(this));