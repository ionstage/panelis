(function(app) {
  'use strict';
  var m = require('mithril');

  var Score = function(option) {
    this.red = m.prop(option.red || 0);
    this.yellow = m.prop(option.yellow || 0);
    this.green = m.prop(option.green || 0);
  };

  Score.prototype.add = function(color, value) {
    this[color](this[color]() + value);
  };

  Score.prototype.reset = function() {
    this.red(0);
    this.yellow(0);
    this.green(0);
  };

  Score.prototype.total = function() {
    return this.red() * 100 + this.yellow() * 50 + this.green() * 300;
  };

  Score.COLOR_RED = 'red';
  Score.COLOR_YELLOW = 'yellow';
  Score.COLOR_GREEN = 'green';

  if (typeof module !== 'undefined' && module.exports)
    module.exports = Score;
  else
    app.Score = Score;
})(this.app || (this.app = {}));