(function(global) {
  'use strict';
  var util = {};

  var document = global.document;

  util.supportsTouch = (document && 'createTouch' in document) || false;

  util.supportsTransitionEnd = (function() {
    if (!document)
      return false;
    var div = document.createElement('div');
    return typeof div.style['transition'] !== 'undefined';
  }());

  util.$globalToLocal = function(gpt) {
    var $viewClassName = app.view.className;

    var stageElement = document.querySelector('.' + $viewClassName);
    var lpt = stageElement.createSVGPoint();
    lpt.x = gpt.x;
    lpt.y = gpt.y;
    return lpt.matrixTransform(stageElement.getScreenCTM().inverse());
  };

  util.$createPanelView = function(option) {
    var $panelView = app.panelView;

    return $panelView({
      panel: m.prop(option.panel),
      x: m.prop(option.x),
      y: m.prop(option.y),
      width: m.prop(option.width)
    });
  };

  if (typeof module !== 'undefined' && module.exports)
    module.exports = util;
  else
    global.util = util;
}(this));