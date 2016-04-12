(function(app) {
  'use strict';

  var Relation = function() {};

  Relation.prototype.prop = function(initialValue) {
    var cache = initialValue;

    return function(value) {
      if (typeof value === 'undefined')
        return cache;

      cache = value;
    };
  };

  Relation.prototype.update = function() {};

  if (typeof module !== 'undefined' && module.exports)
    module.exports = Relation;
  else
    app.Relation = Relation;
})(this.app || (this.app = {}));