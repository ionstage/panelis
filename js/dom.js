(function(app) {
  'use strict';

  var dom = {};

  dom.unsupported = function() {
    return (typeof document === 'undefined');
  };

  dom.el = function(selector) {
    if (selector.charAt(0) === '<') {
      selector = selector.match(/<(.+)>/)[1];
      return document.createElement(selector);
    }

    return document.querySelector(selector);
  };

  dom.append = function(parent, el) {
    parent.appendChild(el);
  };

  dom.remove = function(el) {
    el.parentNode.removeChild(el);
  };

  dom.child = function(el, index) {
    var len = arguments.length;

    if (len === 2)
      return el.children[index];

    for (var i = 1; i < len; i++) {
      index = arguments[i];
      el = el.children[index];
    }

    return el;
  };

  dom.css = function(el, props) {
    var style = el.style;

    for (var key in props) {
      style[key] = props[key];
    }
  };

  dom.addClass = function(el, className) {
    el.classList.add(className);
  };

  dom.removeClass = function(el, className) {
    el.classList.remove(className);
  };

  dom.hasClass = function(el, className) {
    return el.classList.contains(className);
  };

  dom.data = function(el, key, value) {
    if (typeof value === 'undefined')
      return el.dataset[key];

    if (value === null) {
      delete el.dataset[key];
      return;
    }

    el.dataset[key] = value;
  };

  dom.html = function(el, s) {
    el.innerHTML = s;
  };

  dom.on = function(el, type, listener) {
    el.addEventListener(type, listener);
  };

  dom.off = function(el, type, listener) {
    el.removeEventListener(type, listener);
  };

  dom.animate = function(callback) {
    return window.requestAnimationFrame(callback);
  };

  dom.supportsTouch = function() {
    return 'createTouch' in document;
  };

  dom.target = function(event) {
    if (dom.supportsTouch() && 'changedTouches' in event)
      event = event.changedTouches[0];

    return event.target;
  };

  dom.eventType = function(name) {
    var supportsTouch = dom.supportsTouch();

    switch (name) {
    case 'start':
      return (supportsTouch ? 'touchstart' : 'mousedown');
    case 'move':
      return (supportsTouch ? 'touchmove' : 'mousemove');
    case 'end':
      return (supportsTouch ? 'touchend' : 'mouseup');
    }
  };

  if (typeof module !== 'undefined' && module.exports)
    module.exports = dom;
  else
    app.dom = dom;
})(this.app || (this.app = {}));