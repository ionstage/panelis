(function(app) {
  'use strict';

  var helper = app.helper || require('../helper.js');
  var Component = app.Component || require('./component.js');

  var Board = helper.inherits(function(props) {
    Board.super_.call(this);

    this.element = this.prop(props.element);
  }, Component);

  if (typeof module !== 'undefined' && module.exports)
    module.exports = Board;
  else
    app.Board = Board;
})(this.app || (this.app = {}));