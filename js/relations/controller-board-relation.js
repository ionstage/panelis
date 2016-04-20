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

    var selectedPanel = board.selectedPanel();

    if (selectedPanel) {
      var pos = board.selectedPanelPosition();
      var row = pos.row;
      var col = pos.col;

      var top = board.panel(row - 1, col);
      var right = board.panel(row, col + 1);
      var bottom = board.panel(row + 1, col);
      var left = board.panel(row, col - 1);

      var isValid = board.isValidFormation(selectedPanel, top, right, bottom, left);

      controller.okDisabled(!isValid);
    } else {
      controller.okDisabled(true);
    }

    controller.backDisabled(controller.disabled() || !selectedPanel);
  };

  if (typeof module !== 'undefined' && module.exports)
    module.exports = ControllerBoardRelation;
  else
    app.ControllerBoardRelation = ControllerBoardRelation;
})(this.app || (this.app = {}));