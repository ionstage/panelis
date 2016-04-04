(function(app) {
  'use strict';

  var helper = app.helper || require('../helper.js');
  var dom = app.dom || require('../dom.js');
  var Component = app.Component || require('./component.js');
  var Panel = app.Panel || require('./panel.js');

  var ControllerComponent = helper.inherits(function(props) {
    ControllerComponent.super_.call(this);

    this.color = this.prop(props.color);
    this.panels = this.prop(new Array(3));
    this.element = this.prop(props.element);
  }, Component);

  ControllerComponent.prototype.panelColor = function() {
    switch (this.color()) {
    case ControllerComponent.COLOR_WHITE:
      return Panel.COLOR_WHITE;
    case ControllerComponent.COLOR_BLACK:
      return Panel.COLOR_BLACK;
    }
  };

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

  ControllerComponent.prototype.fillEmptySlot = function() {
    var panels = this.panels();

    for (var i = 0, len = panels.length; i < len; i++) {
      if (panels[i])
        continue;

      this.panel(i, new Panel({
        width: 8,
        color: this.panelColor(),
        joints: helper.sample(Panel.JOINTS_PATTERN_LIST),
        isFixed: false
      }));

      // add only one panel at most
      break;
    }
  };

  ControllerComponent.COLOR_WHITE = 'white';
  ControllerComponent.COLOR_BLACK = 'black';

  if (typeof module !== 'undefined' && module.exports)
    module.exports = ControllerComponent;
  else
    app.ControllerComponent = ControllerComponent;
})(this.app || (this.app = {}));