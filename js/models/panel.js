(function(global) {
  'use strict';
  var app = global.app || {};
  var m = global.m || require('mithril');

  var trueOrFalse = function() {
    return Math.floor(Math.random() * 2) === 0;
  };

  var Panel = function(option) {
    this.color = m.prop(option.color || Panel.COLOR_BROWN);
    this.jointTop = m.prop(option.jointTop || false);
    this.jointRight = m.prop(option.jointRight || false);
    this.jointBottom = m.prop(option.jointBottom || false);
    this.jointLeft = m.prop(option.jointLeft || false);
    this.isFixed = m.prop(option.isFixed || false);
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

  Panel.prototype.eachJoint = function(callback) {
    if (this.jointTop())
      callback(Panel.JOINT_TOP);
    if (this.jointRight())
      callback(Panel.JOINT_RIGHT);
    if (this.jointBottom())
      callback(Panel.JOINT_BOTTOM);
    if (this.jointLeft())
      callback(Panel.JOINT_LEFT);
  };

  Panel.prototype.rotate = function() {
    var tmp = this.jointTop();
    this.jointTop(this.jointLeft());
    this.jointLeft(this.jointBottom());
    this.jointBottom(this.jointRight());
    this.jointRight(tmp);
  };

  Panel.prototype.resetRotation = function() {
    for (var i = 0; i < 4; i++) {
      var jointTop = this.jointTop();
      var jointRight = this.jointRight();
      var jointBottom = this.jointBottom();
      var jointLeft = this.jointLeft();
      for (var li = 0, llen = basePanelList.length; li < llen; li++) {
        var basePanel = basePanelList[li];
        if (basePanel.jointTop() === jointTop &&
            basePanel.jointRight() === jointRight &&
            basePanel.jointBottom() === jointBottom &&
            basePanel.jointLeft() === jointLeft)
          return;
      }
      this.rotate();
    }
  };

  Panel.prototype.clone = function() {
    return new Panel({
      color: this.color(),
      jointTop: this.jointTop(),
      jointRight: this.jointRight(),
      jointBottom: this.jointBottom(),
      jointLeft: this.jointLeft(),
      isFixed: this.isFixed()
    });
  };

  Panel.sample = function(color, joint) {
    var jointTop, jointRight, jointBottom, jointLeft;
    if (joint) {
      jointTop = (joint === Panel.JOINT_TOP) ? trueOrFalse() : false;
      jointRight = (joint === Panel.JOINT_RIGHT) ? trueOrFalse() : false;
      jointBottom = (joint === Panel.JOINT_BOTTOM) ? trueOrFalse() : false;
      jointLeft = (joint === Panel.JOINT_LEFT) ? trueOrFalse() : false;
    } else {
      var basePanel = basePanelList[Math.floor(Math.random() * basePanelList.length)];
      jointTop = basePanel.jointTop();
      jointRight = basePanel.jointRight();
      jointBottom = basePanel.jointBottom();
      jointLeft = basePanel.jointLeft();
    }

    return new Panel({
      color: color,
      jointTop: jointTop,
      jointRight: jointRight,
      jointBottom: jointBottom,
      jointLeft: jointLeft
    });
  };

  Panel.COLOR_BROWN = 'brown';
  Panel.COLOR_WHITE = 'white';
  Panel.COLOR_BLACK = 'black';
  Panel.COLOR_GRAY = 'gray';

  Panel.JOINT_TOP = 'top';
  Panel.JOINT_RIGHT = 'right';
  Panel.JOINT_BOTTOM = 'bottom';
  Panel.JOINT_LEFT = 'left';

  var basePanelList = [
    new Panel({jointTop: true}),
    new Panel({jointTop: true, jointRight: true}),
    new Panel({jointTop: true, jointBottom: true}),
    new Panel({jointTop: true, jointRight: true, jointBottom: true}),
    new Panel({jointTop: true, jointRight: true, jointBottom: true, jointLeft: true})
  ];

  app.Panel = Panel;
  global.app = app;
})(this);