(function(app) {
  'use strict';

  var helper = app.helper || require('../helper.js');
  var Relation = app.Relation || require('./relation.js');

  var ControllerBoardRelation = helper.inherits(function(props) {
    this.controller = this.prop(props.controller);
    this.board = this.prop(props.board);
  }, Relation);

  ControllerBoardRelation.prototype.update = function(changedComponent) {
    var controller = this.controller();
    var board = this.board();

    controller.backDisabled(controller.disabled() || !board.selectedPanel());
  };

  if (typeof module !== 'undefined' && module.exports)
    module.exports = ControllerBoardRelation;
  else
    app.ControllerBoardRelation = ControllerBoardRelation;
})(this.app || (this.app = {}));