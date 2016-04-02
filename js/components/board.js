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

  Board.prototype.panel = function(row, col, panel) {
    var panels = this.panels();
    var index = row * 8 + col;

    if (typeof panel === 'undefined')
      return panels[index];

    var currentPanel = panels[index];

    // remove current panel
    if (currentPanel)
      currentPanel.parentElement(null);

    if (panel) {
      var width = panel.width();

      // set the position of the panel on the board
      panel.x(col * width);
      panel.y(row * width);

      // add new panel
      panel.parentElement(this.element());
    }

    panels[index] = panel;
  };

  Board.prototype.reset = function() {
    for (var row = 0; row < 8; row++) {
      for (var col = 0; col < 8; col++) {
        var atTop = (row === 0);
        var atRight = (col === 7);
        var atBottom = (row === 7);
        var atLeft = (col === 0);

        var panel;

        if (atTop || atRight || atBottom || atLeft) {
          var atCorner = (atTop && atLeft) ||
                         (atTop && atRight) ||
                         (atBottom && atLeft) ||
                         (atBottom && atRight);

          var trueOrFalse = (Math.random() < 0.5);

          // the panel at the eage of the board
          panel = new Panel({
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
        } else {
          panel = null;
        }

        this.panel(row, col, panel);
      }
    }
  };

  if (typeof module !== 'undefined' && module.exports)
    module.exports = Board;
  else
    app.Board = Board;
})(this.app || (this.app = {}));