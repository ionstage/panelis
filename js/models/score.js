(function(global) {
  'use strict';
  var m = global.m;
  var app = global.app || {};

  var Score = function() {
    this.red = m.prop(0);
    this.yellow = m.prop(0);
    this.green = m.prop(0);
  };

  Score.prototype.add = function(color, value) {
    this[color](this[color]() + value);
  };

  Score.prototype.sum = function(score) {
    this.add(Score.COLOR_RED, score.red());
    this.add(Score.COLOR_YELLOW, score.yellow());
    this.add(Score.COLOR_GREEN, score.green());
  };

  Score.prototype.reset = function() {
    this.red(0);
    this.yellow(0);
    this.green(0);
  };

  Score.COLOR_RED = 'red';
  Score.COLOR_YELLOW = 'yellow';
  Score.COLOR_GREEN = 'green';

  app.Score = Score;
  global.app = app;
}(this));