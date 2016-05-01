(function(app) {
  'use strict';

  var jCore = require('jcore');
  var helper = app.helper || require('../helper.js');
  var dom = app.dom || require('../dom.js');

  var Root = helper.inherits(function(props) {
    Root.super_.call(this);

    this.widthPerFontSize = this.prop(props.widthPerFontSize);
    this.heightPerFontSize = this.prop(props.heightPerFontSize);
    this.disabled = this.prop(false);
    this.initialized = this.prop(false);
    this.element = this.prop(props.element);

    dom.on(dom.win(), 'resize', function() {
      this.markDirty();
    }.bind(this));

    dom.on(dom.win(), 'orientationchange', function() {
      this.markDirty();
    }.bind(this));

    this.markDirty();
  }, jCore.Component);

  Root.prototype.redraw = function() {
    var element = this.element();
    var widthPerFontSize = this.widthPerFontSize();
    var heightPerFontSize = this.heightPerFontSize();

    var rect = dom.rect(element);
    var width = rect.width;
    var height = rect.height;

    var elementAspectRatio = width / height;
    var contentAspectRatio = widthPerFontSize / heightPerFontSize;

    var fontSize;

    if (elementAspectRatio < contentAspectRatio)
      fontSize = width / widthPerFontSize;
    else
      fontSize = height / heightPerFontSize;

    dom.css(element, {
      fontSize: fontSize + 'px'
    });

    if (this.disabled())
      dom.addClass(element, 'disabled');
    else
      dom.removeClass(element, 'disabled');

    if (!this.initialized()) {
      dom.removeClass(element, 'hide');
      this.initialized(true);
    }
  };

  if (typeof module !== 'undefined' && module.exports)
    module.exports = Root;
  else
    app.Root = Root;
})(this.app || (this.app = {}));