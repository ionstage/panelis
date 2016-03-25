(function(app) {
  'use strict';

  var helper = app.helper || require('../helper.js');
  var dom = app.dom || require('../dom.js');
  var Component = app.Component || require('./component.js');

  var Panel = helper.inherits(function(props) {
    Panel.super_.call(this);

    this.x = this.prop(props.x);
    this.y = this.prop(props.y);
    this.width = this.prop(props.width);
    this.color = this.prop(props.color);
    this.joints = this.prop(props.joints);
    this.isFixed = this.prop(props.isFixed);
    this.element = this.prop(null);
    this.parentElement = this.prop(null);
  }, Component);

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
  };

  Panel.COLOR_NONE = 'none';
  Panel.COLOR_WHITE = 'white';
  Panel.COLOR_BLACK = 'black';
  Panel.COLOR_GRAY = 'gray';

  if (typeof module !== 'undefined' && module.exports)
    module.exports = Panel;
  else
    app.Panel = Panel;
})(this.app || (this.app = {}));