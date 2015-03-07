(function(global) {
  'use strict';
  var util = {};

  var document = global.document;

  util.randomBoolean = function() {
    return Math.random() < 0.5;
  };

  util.isEqual = function(a, b) {
    if (a === b)
      return true;
    if (Object.keys(a).length !== Object.keys(b).length)
      return false;
    for (var key in a) {
      if (a[key] !== b[key])
        return false;
    }
    return true;
  };

  util.inherits = function(ctor, superCtor) {
    ctor.super_ = superCtor;
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    return ctor;
  };

  util.uniq = function(array) {
    var result = [];
    for (var ai = 0, alen = array.length; ai < alen; ai++) {
      var canPush = true;
      var aitem = array[ai];
      for (var ri = 0, rlen = result.length; ri < rlen; ri++) {
        var ritem = result[ri];
        if (util.isEqual(aitem, ritem))
          canPush = false;
      }
      if (canPush)
        result.push(aitem);
    }
    return result;
  };

  util.supportsTouch = (document && 'createTouch' in document) || false;

  util.supportsTransitionEnd = (function() {
    if (!document)
      return false;
    var div = document.createElement('div');
    return typeof div.style['transition'] !== 'undefined';
  }());

  util.addClass = function(el, className) {
    el.setAttribute('class', el.getAttribute('class') + ' ' + className);
  };

  util.replaceClass = function(el, c0, c1) {
    var className = el.getAttribute('class').replace(c0, c1);
    el.setAttribute('class',  className);
  };

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