(function(global) {
  'use strict';
  var m = global.m;
  var app = global.app || {};

  var panelWidth = 72;

  app.actionTileView = function(ctrl) {
    var view = [];

    var panelElement = null;

    if (ctrl.selectedPanel() && ctrl.selectedPosition()) {
      view.push(m('g', {
        config: function(element, isInitialized) {
          if (isInitialized)
            return;
          panelElement = element;

          // rotation end
          panelElement.addEventListener('transitionend', function() {
            ctrl.dispatchEvent({
              type: 'rotationend'
            });
            panelElement.setAttribute('class', 'stop');
          });
        }
      }, [
        app.panelView({
          panel: ctrl.selectedPanel(),
          x: (ctrl.selectedPosition().col - 4) * panelWidth + panelWidth / 2, 
          y: (ctrl.selectedPosition().row - 4) * panelWidth + panelWidth / 2,
          width: panelWidth
        })
      ]));
    }

    view.push(m('rect.hitarea', {
      x: -(panelWidth * 4),
      y: -(panelWidth * 4),
      width: panelWidth * 8,
      height: panelWidth * 8,
      startHandler: function(event) {
        // rotate
        if (ctrl.selectedPanel() && ctrl.selectedPosition()) {
          if (app.supportsTransitionEnd) {
            panelElement.setAttribute('class', 'rotate');
          } else {
            ctrl.dispatchEvent({
              type: 'rotationend'
            });
            panelElement.setAttribute('class', 'stop');
          }
          return;
        }

        // select
        var loc = app.globalToLocal({
          x: event.clientX || event.touches[0].clientX,
          y: event.clientY || event.touches[0].clientY
        });
        var row = parseInt((loc.y + panelWidth * 4) / panelWidth, 10);
        var col = parseInt((loc.x + panelWidth * 4) / panelWidth, 10);
        ctrl.dispatchEvent({
          type: 'select',
          row: row,
          col: col
        });
      },
      config: function(element, isInitialized) {
        if (isInitialized)
          return;
        var eventName = app.supportsTouch ? 'touchstart' : 'mousedown';
        element.addEventListener(eventName, this.attrs.startHandler);
      }
    }));

    return m('g.action-tile', view);
  };

  global.app = app;
}(this));