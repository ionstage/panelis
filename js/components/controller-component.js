(function(app) {
  'use strict';

  var helper = app.helper || require('../helper.js');
  var Component = app.Component || require('./component.js');

  var ControllerComponent = helper.inherits(function() {
    ControllerComponent.super_.call(this);
  }, Component);

  if (typeof module !== 'undefined' && module.exports)
    module.exports = ControllerComponent;
  else
    app.ControllerComponent = ControllerComponent;
})(this.app || (this.app = {}));