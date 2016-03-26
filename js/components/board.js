(function(app) {
  'use strict';

  var helper = app.helper || require('../helper.js');
  var Component = app.Component || require('./component.js');
  var Panel = app.Panel || require('./panel.js');

  var Board = helper.inherits(function(props) {
    Board.super_.call(this);

    this.panels = this.prop(new Array(64));
    this.element = this.prop(props.element);
  }, Component);

  Board.prototype.reset = function() {
    var panels = this.panels();
    var element = this.element();

    for (var row = 0; row < 8; row++) {
      for (var col = 0; col < 8; col++) {
        var index = row * 8 + col;
        var panel = panels[index];

        // remove current panel
        if (panel)
          panel.parentElement(null);

        var atTop = (row === 0);
        var atRight = (col === 7);
        var atBottom = (row === 7);
        var atLeft = (col === 0);

        if (atTop || atRight || atBottom || atLeft) {
          var x = col * 8;
          var y = row * 8;

          var atCorner = (atTop && atLeft) ||
                         (atTop && atRight) ||
                         (atBottom && atLeft) ||
                         (atBottom && atRight);

          var trueOrFalse = (Math.random() < 0.5);

          // the panel at the eage of the board
          panel = new Panel({
            x: x,
            y: y,
            width: 8,
            color: Panel.COLOR_NONE,
            joints: [
              !atCorner && atBottom && trueOrFalse, // joint-top
              !atCorner && atLeft && trueOrFalse,   // joint-right
              !atCorner && atTop && trueOrFalse,    // joint-bottom
              !atCorner && atRight && trueOrFalse   // joint-left
            ],
            isFixed: true
          });

          panel.parentElement(element);
        } else {
          panel = null;
        }

        panels[index] = panel;
      }
    }
  };

  if (typeof module !== 'undefined' && module.exports)
    module.exports = Board;
  else
    app.Board = Board;
})(this.app || (this.app = {}));