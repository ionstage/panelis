(function(app) {
  'use strict';

  var jCore = require('jcore');
  var helper = app.helper || require('../helper.js');

  var ControllerRelation = helper.inherits(function(props) {
    this.whiteController = this.prop(props.whiteController);
    this.blackController = this.prop(props.blackController);
  }, jCore.Relation);

  ControllerRelation.prototype.enabledController = function() {
    var whiteController = this.whiteController();

    if (!whiteController.disabled())
      return whiteController;

    var blackController = this.blackController();

    if (!blackController.disabled())
      return blackController;
  };

  ControllerRelation.prototype.disabledController = function() {
    var whiteController = this.whiteController();

    if (whiteController.disabled())
      return whiteController;

    var blackController = this.blackController();

    if (blackController.disabled())
      return blackController;
  };

  ControllerRelation.prototype.update = function(changedComponent) {
    var whiteController = this.whiteController();
    var blackController = this.blackController();

    if (changedComponent === whiteController)
      blackController.disabled(!whiteController.disabled());
    else if (changedComponent === blackController)
      whiteController.disabled(!blackController.disabled());
  };

  if (typeof module !== 'undefined' && module.exports)
    module.exports = ControllerRelation;
  else
    app.ControllerRelation = ControllerRelation;
})(this.app || (this.app = {}));