(function(app) {
  'use strict';

  var helper = {};

  helper.inherits = function(ctor, superCtor) {
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

  helper.identity = function(value) {
    return value;
  };

  helper.sample = function(list) {
    return list[Math.floor(Math.random() * list.length)];
  };

  helper.deepEqual = function(a, b) {
    if (a === b)
      return true;

    if (a.length !== b.length)
      return false;

    for (var i = 0, len = a.length; i < len; i++) {
      if (a[i] !== b[i])
        return false;
    }

    return true;
  };

  helper.bindAll = function(obj) {
    var proto = Object.getPrototypeOf(obj);

    for (var key in proto) {
      obj[key] = proto[key].bind(obj);
    }
  };

  if (typeof module !== 'undefined' && module.exports)
    module.exports = helper;
  else
    app.helper = helper;
})(this.app || (this.app = {}));