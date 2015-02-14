(function(global) {
  'use strict';
  var m = global.m || require('mithril');

  var trueOrFalse = function() {
    return Math.floor(Math.random() * 2) === 0;
  };

  var isEqual = function(a, b) {
    if (Object.keys(a).length !== Object.keys(b).length)
      return false;
    for (var key in a) {
      if (a[key] !== b[key]) {
        return false;
      }
    }
    return true;
  };

  var uniq = function(array) {
    var result = [];
    for (var ai = 0, alen = array.length; ai < alen; ai++) {
      var canPush = true;
      var aitem = array[ai];
      for (var ri = 0, rlen = result.length; ri < rlen; ri++) {
        var ritem = result[ri];
        if (isEqual(aitem, ritem))
          canPush = false;
      }
      if (canPush)
        result.push(aitem);
    }
    return result;
  };

  var Panel = function(color, top, right, bottom, left) {
    this.color = m.prop(color || Panel.COLOR_BROWN);
    this.isFixed = m.prop(false);
    this.top = m.prop(top || false);
    this.right = m.prop(right || false);
    this.bottom = m.prop(bottom || false);
    this.left = m.prop(left || false);
  };

  Panel.prototype.mixColor = function(color) {
    var srcColor = this.color();
    if (color === Panel.COLOR_WHITE) {
      if (srcColor === Panel.COLOR_BLACK)
        this.color(Panel.COLOR_GRAY);
      else if (srcColor === Panel.COLOR_GRAY)
        this.color(Panel.COLOR_WHITE);
    } else if (color === Panel.COLOR_BLACK) {
      if (srcColor === Panel.COLOR_WHITE)
        this.color(Panel.COLOR_GRAY);
      else if (srcColor === Panel.COLOR_GRAY)
        this.color(Panel.COLOR_BLACK);
    }
  };

  Panel.prototype.hasJoint = function(position, bool) {
    if (typeof bool === 'undefined')
      return this[position]();
    this[position](bool);
  };

  Panel.prototype.setJoint = function(top, right, bottom, left) {
    if (top !== null)
      this.hasJoint(Panel.JOINT_TOP, top);

    if (right !== null)
      this.hasJoint(Panel.JOINT_RIGHT, right);

    if (bottom !== null)
      this.hasJoint(Panel.JOINT_BOTTOM, bottom);

    if (left !== null)
      this.hasJoint(Panel.JOINT_LEFT, left);
  }

  Panel.prototype.rotate = function() {
    var tmp = this.hasJoint(Panel.JOINT_TOP);
    this.hasJoint(Panel.JOINT_TOP, this.hasJoint(Panel.JOINT_LEFT));
    this.hasJoint(Panel.JOINT_LEFT, this.hasJoint(Panel.JOINT_BOTTOM));
    this.hasJoint(Panel.JOINT_BOTTOM, this.hasJoint(Panel.JOINT_RIGHT));
    this.hasJoint(Panel.JOINT_RIGHT, tmp);
  };

  Panel.prototype.clone = function() {
    var clone = new Panel(
      this.color(),
      this.hasJoint(Panel.JOINT_TOP),
      this.hasJoint(Panel.JOINT_RIGHT),
      this.hasJoint(Panel.JOINT_BOTTOM),
      this.hasJoint(Panel.JOINT_LEFT)
    );
    clone.isFixed(this.isFixed());
    return clone;
  };

  var basePanelList = [
    new Panel(null, true, false, false, false),
    new Panel(null, true, true, false, false),
    new Panel(null, true, false, true, false),
    new Panel(null, true, true, true, false),
    new Panel(null, true, true, true, true)
  ];

  Panel.sample = function(color, edge) {
    var panel = new Panel();
    panel.color(color);
    var joint = {};
    if (edge) {
      joint.top = (edge === Tile.EDGE_BOTTOM) ? trueOrFalse() : false;
      joint.right = (edge === Tile.EDGE_LEFT) ? trueOrFalse() : false;
      joint.bottom = (edge === Tile.EDGE_TOP) ? trueOrFalse() : false;
      joint.left = (edge === Tile.EDGE_RIGHT) ? trueOrFalse() : false;
    } else {
      var basePanel = basePanelList[Math.floor(Math.random() * 5)];
      joint.top = basePanel.hasJoint(Panel.JOINT_TOP);
      joint.right = basePanel.hasJoint(Panel.JOINT_RIGHT);
      joint.bottom = basePanel.hasJoint(Panel.JOINT_BOTTOM);
      joint.left = basePanel.hasJoint(Panel.JOINT_LEFT);
    }
    panel.hasJoint(Panel.JOINT_TOP, joint.top);
    panel.hasJoint(Panel.JOINT_RIGHT, joint.right);
    panel.hasJoint(Panel.JOINT_BOTTOM, joint.bottom);
    panel.hasJoint(Panel.JOINT_LEFT, joint.left);
    return panel;
  };

  Panel.COLOR_BROWN = 'brown';
  Panel.COLOR_WHITE = 'white';
  Panel.COLOR_BLACK = 'black';
  Panel.COLOR_GRAY = 'gray';

  Panel.JOINT_TOP = 'top';
  Panel.JOINT_LEFT = 'left';
  Panel.JOINT_BOTTOM = 'bottom';
  Panel.JOINT_RIGHT = 'right';

  var Tile = function(row, col) {
    this.panels = [[]];
    this.reset(row, col);
  };

  Tile.prototype.panel = function(row, col, panel) {
    if (typeof panel === 'undefined')
      return this.panels[row][col];

    this.panels[row][col] = panel;
  };

  Tile.prototype.fix = function(row, col) {
    var panel = this.panel(row, col);
    panel.isFixed(true);
  };

  Tile.prototype.canFix = function(row, col, _panel) {
    var panels = this.panels;

    if (row <= 0 || row >= panels.length - 1)
      return false;

    if (col <= 0 || col >= panels[0].length - 1)
      return false;

    var panel = this.panel(row, col) || _panel;

    var topPanel = this.panel(row - 1, col);
    if (panel.hasJoint(Panel.JOINT_TOP) &&
       (!topPanel || !topPanel.hasJoint(Panel.JOINT_BOTTOM)))
      return false;

    var rightPanel = this.panel(row, col + 1);
    if (panel.hasJoint(Panel.JOINT_RIGHT) &&
        (!rightPanel || !rightPanel.hasJoint(Panel.JOINT_LEFT)))
      return false;

    var bottomPanel = this.panel(row + 1, col);
    if (panel.hasJoint(Panel.JOINT_BOTTOM) &&
        (!bottomPanel || !bottomPanel.hasJoint(Panel.JOINT_TOP)))
      return false;

    var leftPanel = this.panel(row, col - 1);
    if (panel.hasJoint(Panel.JOINT_LEFT) &&
        (!leftPanel || !leftPanel.hasJoint(Panel.JOINT_RIGHT)))
      return false;

    return true;
  };

  Tile.prototype.canJoint = function(row, col, _panel) {
    var panels = this.panels;

    if (row <= 0 || row >= panels.length - 1)
      return false;

    if (col <= 0 || col >= panels[0].length - 1)
      return false;

    var panel = this.panel(row, col) || _panel;

    var topPanel = this.panel(row - 1, col);
    if (topPanel &&
        ((!topPanel.hasJoint(Panel.JOINT_BOTTOM) && panel.hasJoint(Panel.JOINT_TOP)) ||
         (topPanel.hasJoint(Panel.JOINT_BOTTOM) && !panel.hasJoint(Panel.JOINT_TOP))))
      return false;

    var rightPanel = this.panel(row, col + 1);
    if (rightPanel &&
        ((!rightPanel.hasJoint(Panel.JOINT_LEFT) && panel.hasJoint(Panel.JOINT_RIGHT)) ||
         (rightPanel.hasJoint(Panel.JOINT_LEFT) && !panel.hasJoint(Panel.JOINT_RIGHT))))
      return false;

    var bottomPanel = this.panel(row + 1, col);
    if (bottomPanel &&
        ((!bottomPanel.hasJoint(Panel.JOINT_TOP) && panel.hasJoint(Panel.JOINT_BOTTOM)) ||
         (bottomPanel.hasJoint(Panel.JOINT_TOP) && !panel.hasJoint(Panel.JOINT_BOTTOM))))
      return false;

    var leftPanel = this.panel(row, col - 1);
    if (leftPanel &&
        ((!leftPanel.hasJoint(Panel.JOINT_RIGHT) && panel.hasJoint(Panel.JOINT_LEFT)) ||
         (leftPanel.hasJoint(Panel.JOINT_RIGHT) && !panel.hasJoint(Panel.JOINT_LEFT))))
      return false;

    return true;
  };

  Tile.prototype.canJointAnyPosition = function(_panel) {
    var panels = this.panels;
    var row = 0;
    var col = 0;

    if (panels)
      row = panels.length;

    if (panels[0])
      col = panels[0].length;

    if (row === 0 || col === 0)
      return false;

    var panel = _panel.clone();
    for (var ri = 0; ri < row; ri++) {
      for (var ci = 0; ci < col; ci++) {
        if (panels[ri][ci])
          continue;
        for (var i = 0; i < 4; i++) {
          if (this.canJoint(ri, ci, panel))
            return true;
          panel.rotate();
        }
      }
    }

    return false;
  };

  Tile.prototype.isJointed = function(row0, col0, row1, col1) {
    if (!this.panel(row0, col0) || !this.panel(row1, col1))
      return false;

    // top
    if (row0 === row1 + 1 && col0 === col1 &&
        this.panel(row0, col0).hasJoint(Panel.JOINT_TOP) &&
        this.panel(row1, col1).hasJoint(Panel.JOINT_BOTTOM))
      return true;
    // right
    if (row0 === row1 && col0 === col1 - 1 &&
        this.panel(row0, col0).hasJoint(Panel.JOINT_RIGHT) &&
        this.panel(row1, col1).hasJoint(Panel.JOINT_LEFT))
      return true;
    // bottom
    if (row0 === row1 - 1 && col0 === col1 &&
        this.panel(row0, col0).hasJoint(Panel.JOINT_BOTTOM) &&
        this.panel(row1, col1).hasJoint(Panel.JOINT_TOP))
      return true;
    // left
    if (row0 === row1 && col0 === col1 + 1 &&
        this.panel(row0, col0).hasJoint(Panel.JOINT_LEFT) &&
        this.panel(row1, col1).hasJoint(Panel.JOINT_RIGHT))
      return true;
    return false;
  };

  Tile.prototype.releaseColor = function(row, col) {
    var panel = this.panel(row, col);
    var color = panel.color();
    var isReleased = false;

    var topPanel = this.panel(row - 1, col);
    if (topPanel && !topPanel.isFixed() &&
        topPanel.color() !== Panel.COLOR_BROWN &&
        topPanel.hasJoint(Panel.JOINT_BOTTOM) &&
           panel.hasJoint(Panel.JOINT_TOP)) {
      topPanel.mixColor(color);
      isReleased = true;
    }

    var rightPanel = this.panel(row, col + 1);
    if (rightPanel && !rightPanel.isFixed() &&
        rightPanel.color() !== Panel.COLOR_BROWN &&
        rightPanel.hasJoint(Panel.JOINT_LEFT) &&
             panel.hasJoint(Panel.JOINT_RIGHT)) {
      rightPanel.mixColor(color);
      isReleased = true;
    }
      

    var bottomPanel = this.panel(row + 1, col);
    if (bottomPanel && !bottomPanel.isFixed() &&
        bottomPanel.color() !== Panel.COLOR_BROWN &&
        bottomPanel.hasJoint(Panel.JOINT_TOP) &&
              panel.hasJoint(Panel.JOINT_BOTTOM)) {
      bottomPanel.mixColor(color);
      isReleased = true;
    }
      

    var leftPanel = this.panel(row, col - 1);
    if (leftPanel && !leftPanel.isFixed() &&
        leftPanel.color() !== Panel.COLOR_BROWN &&
        leftPanel.hasJoint(Panel.JOINT_RIGHT) &&
            panel.hasJoint(Panel.JOINT_LEFT)) {
      leftPanel.mixColor(color);
      isReleased = true;
    }
    
    return isReleased;
  };

  Tile.prototype.calcChain = function(row, col) {
    var panel = this.panel(row, col);
    if (!panel)
      return [];

    var color = panel.color();
    var chainList = [[{row: row, col: col}]];
    var searched = [{row: row, col: col}];
    var tile = this;

    (function search(index) {
      var list = chainList[index];
      var nextList = [];
      for (var li = 0, llen = list.length; li < llen; li++) {
        var p = list[li];
        // top
        if (tile.isJointed(p.row, p.col, p.row - 1, p.col) &&
            tile.panel(p.row - 1, p.col).color() === color)
          nextList.push({row: p.row - 1, col: p.col});
        // right
        if (tile.isJointed(p.row, p.col, p.row, p.col + 1) &&
            tile.panel(p.row, p.col + 1).color() === color)
          nextList.push({row: p.row, col: p.col + 1});
        // bottom
        if (tile.isJointed(p.row, p.col, p.row + 1, p.col) &&
            tile.panel(p.row + 1, p.col).color() === color)
          nextList.push({row: p.row + 1, col: p.col});
        // left
        if (tile.isJointed(p.row, p.col, p.row, p.col - 1) &&
            tile.panel(p.row, p.col - 1).color() === color)
          nextList.push({row: p.row, col: p.col - 1});
      }

      nextList = uniq(nextList).filter(function(nitem) {
        for (var si = 0, slen = searched.length; si < slen; si++) {
          var sitem = searched[si];
          if (isEqual(nitem, sitem))
            return false;
        }
        return true;
      });
      Array.prototype.push.apply(searched, nextList);

      if (nextList.length > 0) {
        chainList[index + 1] = nextList;
        search(index + 1);
      }
    }(0));

    return chainList;
  };

  Tile.prototype.reset = function(row, col) {
    var panels = this.panels;
    var row = row || 0;
    var col = col || 0;

    if (!row && panels)
      row = panels.length;

    if (!col && panels[0])
      col = panels[0].length;

    for (var ri = 0; ri < row; ri++) {
      panels[ri] = [];
      for (var ci = 0; ci < col; ci++) {
        panels[ri][ci] = null;
      }
    }
  };

  Tile.prototype.randomEdge = function() {
    var panels = this.panels;
    var row = panels.length;
    var col = panels[0].length;

    panels[0][0] = new Panel();
    panels[0][col - 1] = new Panel();
    panels[row - 1][0] = new Panel();
    panels[row - 1][col - 1] = new Panel();

    // top edge
    for (var ci = 1; ci < col - 1; ci++) {
      panels[0][ci] = Panel.sample(Panel.COLOR_BROWN, Tile.EDGE_TOP);
    }
    // right edge
    for (var ri = 1; ri < row - 1; ri++) {
      panels[ri][col - 1] = Panel.sample(Panel.COLOR_BROWN, Tile.EDGE_RIGHT);
    }
    // bottom edge
    for (var ci = 1; ci < col - 1; ci++) {
      panels[row - 1][ci] = Panel.sample(Panel.COLOR_BROWN, Tile.EDGE_BOTTOM);
    }
    // left edge
    for (var ri = 1; ri < row - 1; ri++) {
      panels[ri][0] = Panel.sample(Panel.COLOR_BROWN, Tile.EDGE_LEFT);
    }
  };

  Tile.EDGE_TOP = 'top';
  Tile.EDGE_LEFT = 'left';
  Tile.EDGE_BOTTOM = 'bottom';
  Tile.EDGE_RIGHT = 'right';

  var panelis = {};
  panelis.Panel = Panel;
  panelis.Tile = Tile;
  global.panelis = panelis;
})(this);