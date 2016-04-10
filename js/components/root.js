(function(app) {
  'use strict';

  var helper = app.helper || require('../helper.js');
  var Component = app.Component || require('./component.js');

  var Root = helper.inherits(function() {
    Root.super_.call(this);
  }, Component);

  if (typeof module !== 'undefined' && module.exports)
    module.exports = Root;
  else
    app.Root = Root;
})(this.app || (this.app = {}));