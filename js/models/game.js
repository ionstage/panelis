(function(app) {
  'use strict';

  var Game = function(props) {
    this.currentTurnColor = props.currentTurnColor;
    this.reseter = props.reseter;
  };

  Game.prototype.reset = function() {
    this.reseter();
  };

  Game.COLOR_WHITE = 'white';
  Game.COLOR_BLACK = 'black';

  if (typeof module !== 'undefined' && module.exports)
    module.exports = Game;
  else
    app.Game = Game;
})(this.app || (this.app = {}));