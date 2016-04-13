(function(app) {
  'use strict';

  var helper = app.helper || require('../helper.js');
  var Relation = app.Relation || require('./relation.js');

  var ControllerRelation = helper.inherits(function(props) {
    this.whiteController = this.prop(props.whiteController);
    this.blackController = this.prop(props.blackController);
  }, Relation);

  ControllerRelation.prototype.enabledController = function() {
    var whiteController = this.whiteController();

    if (!whiteController.disabled())
      return whiteController;

    var blackController = this.blackController();

    if (!blackController.disabled())
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