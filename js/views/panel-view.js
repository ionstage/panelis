(function(global) {
  'use strict';
  var m = global.m;
  var panelis = global.panelis;
  var app = global.app || {};

  var panelJointBorderView = function(x, y, width, joint) {
    var attr = {
      width: width / 4,
      height: width / 4
    };
    var Panel = panelis.Panel;

    switch (joint) {
    case Panel.JOINT_TOP:
      attr.x = x - width / 8;
      attr.y = y - width / 2;
      break;
    case Panel.JOINT_RIGHT:
      attr.x = x + width / 2 - width / 4;
      attr.y = y - width / 8;
      break;
    case Panel.JOINT_BOTTOM:
      attr.x = x - width / 8;
      attr.y = y + width / 4;
      break;
    case Panel.JOINT_LEFT:
      attr.x = x - width / 2;
      attr.y = y - width / 8;
      break;
    default:
      break;
    }

    return m('rect.joint.border', attr);
  };

  var panelJointBackView = function(x, y, width, joint) {
    var attr = {};
    var Panel = panelis.Panel;

    switch (joint) {
    case Panel.JOINT_TOP:
      attr.x = x - width / 8 + 1;
      attr.y = y - width / 2 + 1;
      attr.width = width / 4 - 2;
      attr.height = width / 4;
      break;
    case Panel.JOINT_RIGHT:
      attr.x = x + width / 2 - width / 4 + 1;
      attr.y = y - width / 8 + 1;
      attr.width = width / 4 - 2;
      attr.height = width / 4 - 2;
      break;
    case Panel.JOINT_BOTTOM:
      attr.x = x - width / 8 + 1;
      attr.y = y + width / 4 + 1;
      attr.width = width / 4 - 2;
      attr.height = width / 4 - 2;
      break;
    case Panel.JOINT_LEFT:
      attr.x = x - width / 2 + 1;
      attr.y = y - width / 8 + 1;
      attr.width = width / 4;
      attr.height = width / 4 - 2;
      break;
    default:
      break;
    }

    return m('rect.joint.back', attr);
  };

  var panelJointHandleBorderView = function(x, y, width, joint) {
    var attr = {};
    var Panel = panelis.Panel;

    switch (joint) {
    case Panel.JOINT_TOP:
      attr.x = x - width / 8 + 3;
      attr.y = y - width / 2;
      attr.width = width / 4 - 6;
      attr.height = width / 4 + 1;
      break;
    case Panel.JOINT_RIGHT:
      attr.x = x + width / 2 - width / 4 - 1;
      attr.y = y - width / 8 + 3;
      attr.width = width / 4 + 1;
      attr.height = width / 4 - 6;
      break;
    case Panel.JOINT_BOTTOM:
      attr.x = x - width / 8 + 3;
      attr.y = y + width / 4 - 1;
      attr.width = width / 4 - 6;
      attr.height = width / 4 + 1;
      break;
    case Panel.JOINT_LEFT:
      attr.x = x - width / 2;
      attr.y = y - width / 8 + 3;
      attr.width = width / 4 + 1;
      attr.height = width / 4 - 6;
      break;
    default:
      break;
    }

    return m('rect.joint.handle.border', attr);
  }; 

  var panelJointHandleView = function(x, y, width, joint) {
    var attr = {};
    var Panel = panelis.Panel;

    switch (joint) {
    case Panel.JOINT_TOP:
      attr.x = x - width / 8 + 4;
      attr.y = y - width / 2 - 0.3;
      attr.width = width / 4 - 8;
      attr.height = width / 4 + 0.3;
      break;
    case Panel.JOINT_RIGHT:
      attr.x = x + width / 2 - width / 4;
      attr.y = y - width / 8 + 4;
      attr.width = width / 4 + 0.3;
      attr.height = width / 4 - 8;
      break;
    case Panel.JOINT_BOTTOM:
      attr.x = x - width / 8 + 4;
      attr.y = y + width / 4;
      attr.width = width / 4 - 8;
      attr.height = width / 4 + 0.3;
      break;
    case Panel.JOINT_LEFT:
      attr.x = x - width / 2 - 0.3;
      attr.y = y - width / 8 + 4;
      attr.width = width / 4;
      attr.height = width / 4 - 8;
      break;
    default:
      break;
    }

    return m('rect.joint.handle', attr);
  };

  var panelView = function(panel, x, y, width, onclick) {
    var view = [];

    var classes = [];
    var isEdge = panel && panel.color() === panelis.Panel.COLOR_BROWN;
    var isFixed = !panel || panel.isFixed();
    if (isEdge) {
      classes.push('edge');
    } else if (panel) {
      classes.push(isFixed ? 'fixed' : 'unfixed');
    }

    view.push(m('rect.base', {
      x: x - width / 2 + 0.5,
      y: y - width / 2 + 0.5,
      width: width - 1,
      height: width - 1
    }));

    if (!panel)
      return m('g.panel ' + classes.join('.'), view);

    var color = panel.color();
    if (color === panelis.Panel.COLOR_GRAY)
      classes.push('gray');
    else if (color === panelis.Panel.COLOR_WHITE)
      classes.push('white');
    else if (color === panelis.Panel.COLOR_BLACK)
      classes.push('black');

    var Panel = panelis.Panel;

    if (!isFixed && !isEdge) {
      [
        Panel.JOINT_TOP,
        Panel.JOINT_RIGHT,
        Panel.JOINT_BOTTOM,
        Panel.JOINT_LEFT
      ].forEach(function(joint) {
        if (panel.hasJoint(joint))
          view.push(panelJointBorderView(x, y, width, joint));
      });

      view.push(m('circle.color.back', {
        cx: x,
        cy: y,
        r: width / 3.2 + 3
      }));

      [
        Panel.JOINT_TOP,
        Panel.JOINT_RIGHT,
        Panel.JOINT_BOTTOM,
        Panel.JOINT_LEFT
      ].forEach(function(joint) {
        if (panel.hasJoint(joint))
          view.push(panelJointBackView(x, y, width, joint));
      });
    }

    [
      Panel.JOINT_TOP,
      Panel.JOINT_RIGHT,
      Panel.JOINT_BOTTOM,
      Panel.JOINT_LEFT
    ].forEach(function(joint) {
      if (panel.hasJoint(joint)) {
        view.push(panelJointHandleBorderView(x, y, width, joint));
        view.push(panelJointHandleView(x, y, width, joint));
      }
    });

    if (!isEdge) {
      view.push(m('circle.color.circle', {
        cx: x,
        cy: y,
        r: width / 3.2
      }));
    }

    return m('g.panel ' + classes.join('.'), view);
  };

  app.panelView = function(ctrl) {
    return panelView(ctrl.panel, ctrl.x, ctrl.y, ctrl.width);
  };

  global.app = app;
}(this));