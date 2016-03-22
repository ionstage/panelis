(function(app) {
  'use strict';

  var helper = app.helper || require('../helper.js');
  var Component = app.Component || require('./component.js');

  var Board = helper.inherits(function() {
    Board.super_.call(this);
  }, Component);

  if (typeof module !== 'undefined' && module.exports)
    module.exports = Board;
  else
    app.Board = Board;
})(this.app || (this.app = {}));