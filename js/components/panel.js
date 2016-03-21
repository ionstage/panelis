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