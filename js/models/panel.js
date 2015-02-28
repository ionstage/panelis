(function(global) {
  'use strict';
  var app = global.app || {};
  var m = global.m || require('mithril');

  var trueOrFalse = function() {
    return Math.floor(Math.random() * 2) === 0;
  };

  var Panel = function(color, top, right, bottom, left) {
    this.color = m.prop(color || Panel.COLOR_BROWN);
    this.isFixed = m.prop(false);
    this.top = m.prop(top || false);
    this.right = m.prop(right || false);
    this.bottom = m.prop(bottom || false);
    this.left = m.prop(left || false);
  };

  Panel.prototype.mixColor = function(color) {
    var srcColor = this.color();
    if (color === Panel.COLOR_WHITE) {
      if (srcColor === Panel.COLOR_BLACK)
        this.color(Panel.COLOR_GRAY);
      else if (srcColor === Panel.COLOR_GRAY)
        this.color(Panel.COLOR_WHITE);
    } else if (color === Panel.COLOR_BLACK) {
      if (srcColor === Panel.COLOR_WHITE)
        this.color(Panel.COLOR_GRAY);
      else if (srcColor === Panel.COLOR_GRAY)
        this.color(Panel.COLOR_BLACK);
    }
  };

  Panel.prototype.hasJoint = function(position, bool) {
    if (typeof bool === 'undefined')
      return this[position]();
    this[position](bool);
  };

  Panel.prototype.setJoint = function(top, right, bottom, left) {
    if (top !== null)
      this.hasJoint(Panel.JOINT_TOP, top);

    if (right !== null)
      this.hasJoint(Panel.JOINT_RIGHT, right);

    if (bottom !== null)
      this.hasJoint(Panel.JOINT_BOTTOM, bottom);

    if (left !== null)
      this.hasJoint(Panel.JOINT_LEFT, left);
  }

  Panel.prototype.rotate = function() {
    var tmp = this.hasJoint(Panel.JOINT_TOP);
    this.hasJoint(Panel.JOINT_TOP, this.hasJoint(Panel.JOINT_LEFT));
    this.hasJoint(Panel.JOINT_LEFT, this.hasJoint(Panel.JOINT_BOTTOM));
    this.hasJoint(Panel.JOINT_BOTTOM, this.hasJoint(Panel.JOINT_RIGHT));
    this.hasJoint(Panel.JOINT_RIGHT, tmp);
  };

  Panel.prototype.resetRotation = function() {
    for (var i = 0; i < 4; i++) {
      var top = this.hasJoint(Panel.JOINT_TOP);
      var right = this.hasJoint(Panel.JOINT_RIGHT);
      var bottom = this.hasJoint(Panel.JOINT_BOTTOM);
      var left = this.hasJoint(Panel.JOINT_LEFT);
      for (var li = 0, llen = basePanelList.length; li < llen; li++) {
        var basePanel = basePanelList[li];
        if (basePanel.hasJoint(Panel.JOINT_TOP) === top &&
            basePanel.hasJoint(Panel.JOINT_RIGHT) === right &&
            basePanel.hasJoint(Panel.JOINT_BOTTOM) === bottom &&
            basePanel.hasJoint(Panel.JOINT_LEFT) === left)
          return;
      }
      this.rotate();
    }
  };

  Panel.prototype.clone = function() {
    var clone = new Panel(
      this.color(),
      this.hasJoint(Panel.JOINT_TOP),
      this.hasJoint(Panel.JOINT_RIGHT),
      this.hasJoint(Panel.JOINT_BOTTOM),
      this.hasJoint(Panel.JOINT_LEFT)
    );
    clone.isFixed(this.isFixed());
    return clone;
  };

  var basePanelList = [
    new Panel(null, true, false, false, false),
    new Panel(null, true, true, false, false),
    new Panel(null, true, false, true, false),
    new Panel(null, true, true, true, false),
    new Panel(null, true, true, true, true)
  ];

  Panel.sample = function(color, joint) {
    var top, right, bottom, left;
    if (joint) {
      top = (joint === Panel.JOINT_TOP) ? trueOrFalse() : false;
      right = (joint === Panel.JOINT_RIGHT) ? trueOrFalse() : false;
      bottom = (joint === Panel.JOINT_BOTTOM) ? trueOrFalse() : false;
      left = (joint === Panel.JOINT_LEFT) ? trueOrFalse() : false;
    } else {
      var basePanel = basePanelList[Math.floor(Math.random() * 5)];
      top = basePanel.hasJoint(Panel.JOINT_TOP);
      right = basePanel.hasJoint(Panel.JOINT_RIGHT);
      bottom = basePanel.hasJoint(Panel.JOINT_BOTTOM);
      left = basePanel.hasJoint(Panel.JOINT_LEFT);
    }

    return new Panel(color, top, right, bottom, left);
  };

  Panel.COLOR_BROWN = 'brown';
  Panel.COLOR_WHITE = 'white';
  Panel.COLOR_BLACK = 'black';
  Panel.COLOR_GRAY = 'gray';

  Panel.JOINT_TOP = 'top';
  Panel.JOINT_LEFT = 'left';
  Panel.JOINT_BOTTOM = 'bottom';
  Panel.JOINT_RIGHT = 'right';

  app.Panel = Panel;
  global.app = app;
})(this);