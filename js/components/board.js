(function(app) {
  'use strict';

  var helper = app.helper || require('../helper.js');
  var dom = app.dom || require('../dom.js');
  var Component = app.Component || require('./component.js');
  var Panel = app.Panel || require('./panel.js');

  var Board = helper.inherits(function(props) {
    Board.super_.call(this);

    var rowLength = props.rowLength;
    var colLength = props.colLength;

    this.rowLength = this.prop(rowLength);
    this.colLength = this.prop(colLength);
    this.panels = this.prop(new Array(rowLength * colLength));
    this.selectedPanelIndex = this.prop(-1);
    this.element = this.prop(props.element);
    this.pointer = props.pointer;

    var onpoint = Board.prototype.onpoint.bind(this);

    dom.on(this.element(), dom.eventType('start'), onpoint);
  }, Component);

  Board.prototype.panelPosition = function(panel) {
    var index = this.panels().indexOf(panel);
    var colLength = this.colLength();
    var row = (index !== -1) ? Math.floor(index / colLength) : -1;
    var col = (index !== -1) ? index % colLength : -1;
    return { row: row, col: col };
  };

  Board.prototype.selectedPanel = function(panel) {
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

  Board.prototype.panel = function(row, col, panel) {
    var panels = this.panels();
    var index = row * this.colLength() + col;

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
      var width = panel.width();

      // set the position of the panel on the board
      panel.x(col * width);
      panel.y(row * width);

      // add new panel
      panel.parentElement(this.element());
    }

    panels[index] = panel;
  };

  Board.prototype.removePanel = function(panel) {
    var pos = this.panelPosition(panel);
    this.panel(pos.row, pos.col, null);
  };

  Board.prototype.reset = function() {
    var rowLength = this.rowLength();
    var colLength = this.colLength();

    for (var row = 0; row < rowLength; row++) {
      for (var col = 0; col < colLength; col++) {
        var atTop = (row === 0);
        var atRight = (col === colLength - 1);
        var atBottom = (row === rowLength - 1);
        var atLeft = (col === 0);

        var panel;

        if (atTop || atRight || atBottom || atLeft) {
          var atCorner = (atTop && atLeft) ||
                         (atTop && atRight) ||
                         (atBottom && atLeft) ||
                         (atBottom && atRight);

          var trueOrFalse = (Math.random() < 0.5);

          // the panel at the eage of the board
          panel = new Panel({
            width: 8,
            color: Panel.COLOR_NONE,
            joints: [
              !atCorner && atBottom && trueOrFalse, // joint-top
              !atCorner && atLeft && trueOrFalse,   // joint-right
              !atCorner && atTop && trueOrFalse,    // joint-bottom
              !atCorner && atRight && trueOrFalse   // joint-left
            ],
            isFixed: true
          });
        } else {
          panel = null;
        }

        this.panel(row, col, panel);
      }
    }
  };

  Board.prototype.isValidFormation = function(center, top, right, bottom, left) {
    if (top && center.hasJoint(Panel.JOINT_TOP) !== top.hasJoint(Panel.JOINT_BOTTOM))
      return false;

    if (right && center.hasJoint(Panel.JOINT_RIGHT) !== right.hasJoint(Panel.JOINT_LEFT))
      return false;

    if (bottom && center.hasJoint(Panel.JOINT_BOTTOM) !== bottom.hasJoint(Panel.JOINT_TOP))
      return false;

    if (left && center.hasJoint(Panel.JOINT_LEFT) !== left.hasJoint(Panel.JOINT_RIGHT))
      return false;

    return true;
  };

  Board.prototype.connectedPanels = function(panel) {
    var pos = this.panelPosition(panel);
    var row = pos.row;
    var col = pos.col;

    var top = this.panel(row - 1, col);
    var right = this.panel(row, col + 1);
    var bottom = this.panel(row + 1, col);
    var left = this.panel(row, col - 1);

    var panels = [];

    if (top && panel.hasJoint(Panel.JOINT_TOP) && top.hasJoint(Panel.JOINT_BOTTOM))
      panels.push(top);

    if (right && panel.hasJoint(Panel.JOINT_RIGHT) && right.hasJoint(Panel.JOINT_LEFT))
      panels.push(right);

    if (bottom && panel.hasJoint(Panel.JOINT_BOTTOM) && bottom.hasJoint(Panel.JOINT_TOP))
      panels.push(bottom);

    if (left && panel.hasJoint(Panel.JOINT_LEFT) && left.hasJoint(Panel.JOINT_RIGHT))
      panels.push(left);

    return panels;
  };

  Board.prototype.isAllJointsConnected = function(panel) {
    var connectedPanels = this.connectedPanels(panel);
    return (panel.joints().filter(helper.identity).length === connectedPanels.length);
  };

  Board.prototype.onpoint = function(event) {
    var rect = dom.rect(this.element());

    var point = dom.clientPoint(event, {
      x: rect.left,
      y: rect.top
    });

    var width = rect.width / 8;

    var row = Math.floor(point.y / width);
    var col = Math.floor(point.x / width);

    if (row < 0 || row > this.rowLength() - 1 || col < 0 || col > this.colLength() - 1)
      return;

    dom.stop(event);
    this.pointer(row, col);
  };

  if (typeof module !== 'undefined' && module.exports)
    module.exports = Board;
  else
    app.Board = Board;
})(this.app || (this.app = {}));