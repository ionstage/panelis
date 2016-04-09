(function(app) {
  'use strict';

  var Game = function() {};

  if (typeof module !== 'undefined' && module.exports)
    module.exports = Game;
  else
    app.Game = Game;
})(this.app || (this.app = {}));