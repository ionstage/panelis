(function(app) {
  'use strict';

  var helper = app.helper || require('../helper.js');
  var dom = app.dom || require('../dom.js');
  var Component = app.Component || require('./component.js');

  var Panel = helper.inherits(function() {
    Panel.super_.call(this);

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
      dom.append(parentElement, element);
      return;
    }

    // remove element
    if (!parentElement && element) {
      dom.remove(element);
      this.element(null);
      return;
    }
  };

  if (typeof module !== 'undefined' && module.exports)
    module.exports = Panel;
  else
    app.Panel = Panel;
})(this.app || (this.app = {}));