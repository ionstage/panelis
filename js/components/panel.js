(function(app) {
  'use strict';

  var helper = app.helper || require('../helper.js');
  var dom = app.dom || require('../dom.js');
  var Component = app.Component || require('./component.js');

  var Panel = helper.inherits(function(props) {
    Panel.super_.call(this);

    this.x = this.prop(0);
    this.y = this.prop(0);
    this.width = this.prop(props.width);
    this.color = this.prop(props.color);
    this.joints = this.prop(props.joints.slice());
    this.isFixed = this.prop(props.isFixed);
    this.isFocused = this.prop(false);
    this.element = this.prop(null);
    this.parentElement = this.prop(null);
  }, Component);

  Panel.prototype.props = function() {
    return {
      width: this.width(),
      color: this.color(),
      joints: this.joints().slice(),
      isFixed: this.isFixed()
    };
  };

  Panel.prototype.hasJoint = function(joint) {
    return this.joints()[joint];
  };

  Panel.prototype.rotate = function() {
    var joints = this.joints();
    joints.unshift(joints.pop());
    this.markDirty();
  };

  Panel.prototype.rotateWithAnimation = function() {
    return new Promise(function(resolve, reject) {
      var element = this.element();

      if (dom.hasClass(element, 'panel-rotate')) {
        // the panel is now rotating
        reject();
        return;
      }

      dom.addClass(element, 'panel-rotate');

      var ontransitionend = function() {
        dom.off(element, 'transitionend', ontransitionend);
        dom.removeClass(element, 'panel-rotate');
        this.rotate();
        resolve();
      }.bind(this);

      dom.on(element, 'transitionend', ontransitionend);

      var transform = 'translate(' + this.x() + 'rem, ' + this.y() + 'rem) rotate(90deg)';

      dom.css(element, {
        transform: transform,
        webkitTransform: transform
      });
    }.bind(this));
  };

  Panel.prototype.resetRotation = function() {
    var list = Panel.JOINTS_PATTERN_LIST;

    for (var i = 0; i < 4; i++) {
      var joints = this.joints();

      for (var j = 0, len = list.length; j < len; j++) {
        var pattern = list[j];

        if (helper.deepEqual(joints, pattern))
          return;
      }

      this.rotate();
    }
  };

  Panel.prototype.flash = function(flashColor) {
    return new Promise(function(resolve, reject) {
      var element = this.element();

      if (dom.data(element, 'flashColor')) {
        // the panel is now flashing
        dom.data(element, 'flashColor', null);
      }

      var ontransitionend = function() {
        dom.off(element, 'transitionend', ontransitionend);
        resolve();
      };

      dom.on(element, 'transitionend', ontransitionend);

      dom.data(element, 'flashColor', flashColor);

      setTimeout(function() {
        dom.data(element, 'flashColor', null);
      }, 1000 / 60);
    }.bind(this));
  };

  Panel.prototype.redraw = function() {
    var element = this.element();
    var parentElement = this.parentElement();

    if (!parentElement && !element)
      return;

    // add element
    if (parentElement && !element) {
      element = dom.el('<div>');

      dom.addClass(element, 'panel');

      dom.html(element, [
        '<div class="panel-back-circle"></div>',
        '<div class="panel-back-joint-top"></div>',
        '<div class="panel-back-joint-right"></div>',
        '<div class="panel-back-joint-bottom"></div>',
        '<div class="panel-back-joint-left"></div>',
        '<div class="panel-front-joint-top"></div>',
        '<div class="panel-front-joint-right"></div>',
        '<div class="panel-front-joint-bottom"></div>',
        '<div class="panel-front-joint-left"></div>',
        '<div class="panel-front-circle"></div>'
      ].join(''));

      this.element(element);
      this.redraw();
      dom.append(parentElement, element);
      return;
    }

    // remove element
    if (!parentElement && element) {
      dom.remove(element);
      this.element(null);
      return;
    }

    // update element
    var translate = 'translate(' + this.x() + 'rem, ' + this.y() + 'rem)';

    dom.css(element, {
      height: this.width() + 'rem',
      transform: translate,
      webkitTransform: translate,
      width: this.width() + 'rem'
    });

    dom.data(element, 'color', this.color());

    ['top', 'right', 'bottom', 'left'].forEach(function(name, index) {
      if (this.joints()[index])
        dom.addClass(element, 'panel-joint-' + name);
      else
        dom.removeClass(element, 'panel-joint-' + name);
    }.bind(this));

    if (this.isFixed())
      dom.addClass(element, 'panel-fixed');
    else
      dom.removeClass(element, 'panel-fixed');

    if (this.isFocused())
      dom.addClass(element, 'panel-focused');
    else
      dom.removeClass(element, 'panel-focused');
  };

  Panel.COLOR_NONE = 'none';
  Panel.COLOR_WHITE = 'white';
  Panel.COLOR_BLACK = 'black';
  Panel.COLOR_GRAY = 'gray';

  Panel.JOINT_TOP = 0;
  Panel.JOINT_RIGHT = 1;
  Panel.JOINT_BOTTOM = 2;
  Panel.JOINT_LEFT = 3;

  Panel.JOINTS_PATTERN_LIST = [
    [true, false, false, false],
    [true, true, false, false],
    [true, false, true, false],
    [true, true, true, false],
    [true, true, true, true]
  ];

  Panel.FLASH_COLOR_RED = 'red';
  Panel.FLASH_COLOR_YELLOW = 'yellow';
  Panel.FLASH_COLOR_GREEN = 'green';

  if (typeof module !== 'undefined' && module.exports)
    module.exports = Panel;
  else
    app.Panel = Panel;
})(this.app || (this.app = {}));