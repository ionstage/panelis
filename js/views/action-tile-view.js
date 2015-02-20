(function(global) {
  'use strict';
  var app = global.app || {};
  var m = global.m || require('mithril');

  var addClass = function(el, className) {
    el.setAttribute('class', el.getAttribute('class') + ' ' + className);
  };

  var replaceClass = function(el, c0, c1) {
    var className = el.getAttribute('class').replace(c0, c1);
    el.setAttribute('class',  className);
  };

  var actionTileView = function(ctrl) {
    var panelWidth = ctrl.panelWidth();

    var view = [];

    var panelElement = null;

    if (ctrl.selectedPanel() && ctrl.selectedPosition()) {
      var x = (ctrl.selectedPosition().col - 4) * panelWidth + panelWidth / 2;
      var y = (ctrl.selectedPosition().row - 4) * panelWidth + panelWidth / 2;
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
        app.panelView({
          panel: ctrl.selectedPanel(),
          x: 0,
          y: 0,
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

  app.actionTileView = actionTileView;
  global.app = app;
}(this));