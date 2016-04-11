(function(app) {
  'use strict';

  var helper = app.helper || require('../helper.js');
  var dom = app.dom || require('../dom.js');
  var Component = app.Component || require('./component.js');

  var Root = helper.inherits(function(props) {
    Root.super_.call(this);

    this.fontSize = this.prop(props.fontSize);
    this.element = this.prop(props.element);

    this.markDirty();
  }, Component);

  Root.prototype.redraw = function() {
    dom.css(this.element(), {
      fontSize: this.fontSize() + 'px'
    });
  };

  if (typeof module !== 'undefined' && module.exports)
    module.exports = Root;
  else
    app.Root = Root;
})(this.app || (this.app = {}));