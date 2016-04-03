(function(app) {
  'use strict';

  var helper = app.helper || require('../helper.js');
  var dom = app.dom || require('../dom.js');
  var Component = app.Component || require('./component.js');

  var ControllerComponent = helper.inherits(function(props) {
    ControllerComponent.super_.call(this);

    this.panels = this.prop(new Array(3));
    this.element = this.prop(props.element);
  }, Component);

  ControllerComponent.prototype.slotElement = function(index) {
    return dom.child(this.element(), 2, 0, index);
  };

  ControllerComponent.prototype.panel = function(index, panel) {
    var panels = this.panels();

    if (typeof panel === 'undefined')
      return panels[index];

    var currentPanel = panels[index];

    // remove current panel
    if (currentPanel)
      currentPanel.parentElement(null);

    if (panel) {
      // add new panel
      panel.parentElement(this.slotElement(index));
    }

    panels[index] = panel;
  };

  if (typeof module !== 'undefined' && module.exports)
    module.exports = ControllerComponent;
  else
    app.ControllerComponent = ControllerComponent;
})(this.app || (this.app = {}));