(function(app) {
  'use strict';

  var helper = app.helper || require('../helper.js');
  var dom = app.dom || require('../dom.js');
  var Component = app.Component || require('./component.js');
  var Panel = app.Panel || require('./panel.js');

  var Score = function() {
    this.erase = 0;
    this.chain = 0;
    this.fix = 0;
  };

  var ControllerComponent = helper.inherits(function(props) {
    ControllerComponent.super_.call(this);

    this.color = this.prop(props.color);
    this.panels = this.prop(new Array(3));
    this.selectedPanelIndex = this.prop(-1);
    this.score = this.prop(new Score());
    this.disabled = this.prop(true);
    this.okDisabled = this.prop(true);
    this.backDisabled = this.prop(true);
    this.element = this.prop(props.element);

    this.okExecutor = props.okExecutor;
    this.backExecutor = props.backExecutor;

    dom.on(this.okButtonElement(), 'click', function() {
      this.okExecutor();
    }.bind(this));

    dom.on(this.backButtonElement(), 'click', function() {
      this.backExecutor();
    }.bind(this));

    dom.on(this.slotWrapperElement(), dom.eventType('start'), function(event) {
      var panels = this.panels();

      var hasEmptySlot = !panels[0] || !panels[1] || !panels[2];

      if (hasEmptySlot)
        return;

      var index = +dom.data(dom.target(event), 'index');

      if (isNaN(index))
        return;

      dom.stop(event);
      this.selectedPanel(panels[index]);
    }.bind(this));

    dom.on(dom.doc(), dom.eventType('start'), function(event) {
      if (dom.target(event) === this.okButtonElement()) {
        // keep the selected panel
        return;
      }

      this.selectedPanel(null);
    }.bind(this));
  }, Component);

  ControllerComponent.prototype.okButtonElement = function() {
    return dom.child(this.element(), 1, 0);
  };

  ControllerComponent.prototype.backButtonElement = function() {
    return dom.child(this.element(), 1, 1);
  };

  ControllerComponent.prototype.panelColor = function() {
    switch (this.color()) {
    case ControllerComponent.COLOR_WHITE:
      return Panel.COLOR_WHITE;
    case ControllerComponent.COLOR_BLACK:
      return Panel.COLOR_BLACK;
    }
  };

  ControllerComponent.prototype.selectedPanel = function(panel) {
    var panels = this.panels();
    var selectedPanel = panels[this.selectedPanelIndex()] || null;

    if (typeof panel === 'undefined')
      return selectedPanel;

    if (panel === selectedPanel) {
      // selection is not changed
      return;
    }

    if (panel === null) {
      // clear selection
      if (selectedPanel) {
        selectedPanel.isFocused(false);
        this.selectedPanelIndex(-1);
      }

      return;
    }

    var index = panels.indexOf(panel);

    if (index === -1)
      return;

    if (selectedPanel)
      selectedPanel.isFocused(false);

    panel.isFocused(true);
    this.selectedPanelIndex(index);
  };

  ControllerComponent.prototype.slotWrapperElement = function() {
    return dom.child(this.element(), 2, 0);
  };

  ControllerComponent.prototype.slotElement = function(index) {
    return dom.child(this.element(), 2, 0, index);
  };

  ControllerComponent.prototype.scoreEraseElement = function() {
    return dom.child(this.element(), 3, 0, 2);
  };

  ControllerComponent.prototype.scoreChainElement = function() {
    return dom.child(this.element(), 3, 1, 2);
  };

  ControllerComponent.prototype.scoreFixElement = function() {
    return dom.child(this.element(), 3, 2, 2);
  };

  ControllerComponent.prototype.panel = function(index, panel) {
    var panels = this.panels();

    if (typeof panel === 'undefined')
      return panels[index];

    var currentPanel = panels[index];

    // remove current panel
    if (currentPanel) {
      if (currentPanel === this.selectedPanel())
        this.selectedPanel(null);

      currentPanel.parentElement(null);
    }

    if (panel) {
      // add new panel
      panel.parentElement(this.slotElement(index));
    }

    panels[index] = panel;
  };

  ControllerComponent.prototype.removePanel = function(panel) {
    this.panel(this.panels().indexOf(panel), null);
  };

  ControllerComponent.prototype.emptySlotIndex = function() {
    var panels = this.panels();

    for (var i = 0, len = panels.length; i < len; i++) {
      if (!panels[i])
        return i;
    }

    return -1;
  };

  ControllerComponent.prototype.fillEmptySlot = function() {
    var index = this.emptySlotIndex();

    if (index === -1)
      return;

    // add only one panel at most
    this.panel(index, new Panel({
      width: 8,
      color: this.panelColor(),
      joints: helper.sample(Panel.JOINTS_PATTERN_LIST),
      isFixed: false
    }));
  };

  ControllerComponent.prototype.incrementScore = function(scoreType) {
    this.score()[scoreType]++;
    this.markDirty();
  };

  ControllerComponent.prototype.reset = function() {
    var panels = this.panels();

    // remove all panels
    for (var i = 0, len = panels.length; i < len; i++) {
      if (panels[i])
        this.panel(i, null);
    }

    // add two panels
    this.fillEmptySlot();
    this.fillEmptySlot();
  };

  ControllerComponent.prototype.redraw = function() {
    if (this.disabled())
      dom.addClass(this.element(), 'disabled');
    else
      dom.removeClass(this.element(), 'disabled');

    dom.disabled(this.okButtonElement(), this.okDisabled());
    dom.disabled(this.backButtonElement(), this.backDisabled());

    var score = this.score();

    dom.text(this.scoreEraseElement(), score.erase);
    dom.text(this.scoreChainElement(), score.chain);
    dom.text(this.scoreFixElement(), score.fix);
  };

  ControllerComponent.COLOR_WHITE = 'white';
  ControllerComponent.COLOR_BLACK = 'black';

  ControllerComponent.SCORE_TYPE_ERASE = 'erase';
  ControllerComponent.SCORE_TYPE_CHAIN = 'chain';
  ControllerComponent.SCORE_TYPE_FIX = 'fix';

  if (typeof module !== 'undefined' && module.exports)
    module.exports = ControllerComponent;
  else
    app.ControllerComponent = ControllerComponent;
})(this.app || (this.app = {}));