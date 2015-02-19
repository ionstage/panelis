(function(global) {
  'use strict';
  var m = global.m;
  var panelis = global.panelis;
  var app = global.app || {};

  var Panel = panelis.Panel;

  var panelJointList = [
    Panel.JOINT_TOP,
    Panel.JOINT_RIGHT,
    Panel.JOINT_BOTTOM,
    Panel.JOINT_LEFT
  ];

  var panelJointBorderView = function(width, joint) {
    var attr = {
      width: width / 4,
      height: width / 4
    };

    switch (joint) {
    case Panel.JOINT_TOP:
      attr.x = -(width / 8);
      attr.y = -(width / 2);
      break;
    case Panel.JOINT_RIGHT:
      attr.x = width / 2 - width / 4;
      attr.y = -(width / 8);
      break;
    case Panel.JOINT_BOTTOM:
      attr.x = -(width / 8);
      attr.y = width / 4;
      break;
    case Panel.JOINT_LEFT:
      attr.x = -(width / 2);
      attr.y = -(width / 8);
      break;
    default:
      break;
    }

    return m('rect.joint.border', attr);
  };

  var panelJointBackView = function(width, joint) {
    var attr = {};

    switch (joint) {
    case Panel.JOINT_TOP:
      attr.x = -(width / 8) + 1;
      attr.y = -(width / 2) + 1;
      attr.width = width / 4 - 2;
      attr.height = width / 4;
      break;
    case Panel.JOINT_RIGHT:
      attr.x = width / 2 - width / 4 + 1;
      attr.y = -(width / 8) + 1;
      attr.width = width / 4 - 2;
      attr.height = width / 4 - 2;
      break;
    case Panel.JOINT_BOTTOM:
      attr.x = -(width / 8) + 1;
      attr.y = width / 4 + 1;
      attr.width = width / 4 - 2;
      attr.height = width / 4 - 2;
      break;
    case Panel.JOINT_LEFT:
      attr.x = -(width / 2) + 1;
      attr.y = -(width / 8) + 1;
      attr.width = width / 4;
      attr.height = width / 4 - 2;
      break;
    default:
      break;
    }

    return m('rect.joint.back', attr);
  };

  var panelJointHandleBorderView = function(width, joint) {
    var attr = {};

    switch (joint) {
    case Panel.JOINT_TOP:
      attr.x = -(width / 8) + 3;
      attr.y = -(width / 2);
      attr.width = width / 4 - 6;
      attr.height = width / 4 + 1;
      break;
    case Panel.JOINT_RIGHT:
      attr.x = width / 2 - width / 4 - 1;
      attr.y = -(width / 8) + 3;
      attr.width = width / 4 + 1;
      attr.height = width / 4 - 6;
      break;
    case Panel.JOINT_BOTTOM:
      attr.x = -(width / 8) + 3;
      attr.y = width / 4 - 1;
      attr.width = width / 4 - 6;
      attr.height = width / 4 + 1;
      break;
    case Panel.JOINT_LEFT:
      attr.x = -(width / 2);
      attr.y = -(width / 8) + 3;
      attr.width = width / 4 + 1;
      attr.height = width / 4 - 6;
      break;
    default:
      break;
    }

    return m('rect.joint.handle.border', attr);
  }; 

  var panelJointHandleView = function(width, joint) {
    var attr = {};

    switch (joint) {
    case Panel.JOINT_TOP:
      attr.x = -(width / 8) + 4;
      attr.y = -(width / 2) - 0.3;
      attr.width = width / 4 - 8;
      attr.height = width / 4 + 0.3;
      break;
    case Panel.JOINT_RIGHT:
      attr.x = width / 2 - width / 4;
      attr.y = -(width / 8) + 4;
      attr.width = width / 4 + 0.3;
      attr.height = width / 4 - 8;
      break;
    case Panel.JOINT_BOTTOM:
      attr.x = -(width / 8) + 4;
      attr.y = width / 4;
      attr.width = width / 4 - 8;
      attr.height = width / 4 + 0.3;
      break;
    case Panel.JOINT_LEFT:
      attr.x = -(width / 2) - 0.3;
      attr.y = -(width / 8) + 4;
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
    var isEdge = panel && panel.color() === Panel.COLOR_BROWN;
    var isFixed = !panel || panel.isFixed();
    if (isEdge) {
      classes.push('edge');
    } else if (panel) {
      classes.push(isFixed ? 'fixed' : 'unfixed');
    }

    view.push(m('rect.base', {
      x: -(width / 2) + 0.5,
      y: -(width / 2) + 0.5,
      width: width - 1,
      height: width - 1
    }));

    var transform = 'translate(' + x + ' ' + y +  ')';

    if (!panel) {
      return m('g.panel ' + classes.join('.'), {
        transform: transform
      }, view);
    }

    var color = panel.color();
    if (color === Panel.COLOR_GRAY)
      classes.push('gray');
    else if (color === Panel.COLOR_WHITE)
      classes.push('white');
    else if (color === Panel.COLOR_BLACK)
      classes.push('black');

    if (!isFixed && !isEdge) {
      panelJointList.forEach(function(joint) {
        if (panel.hasJoint(joint))
          view.push(panelJointBorderView(width, joint));
      });

      view.push(m('circle.color.back', {
        cx: 0,
        cy: 0,
        r: width / 3.2 + 3
      }));

      panelJointList.forEach(function(joint) {
        if (panel.hasJoint(joint))
          view.push(panelJointBackView(width, joint));
      });
    }

    panelJointList.forEach(function(joint) {
      if (panel.hasJoint(joint)) {
        view.push(panelJointHandleBorderView(width, joint));
        view.push(panelJointHandleView(width, joint));
      }
    });

    if (!isEdge) {
      view.push(m('circle.color.circle', {
        cx: 0,
        cy: 0,
        r: width / 3.2
      }));
    }

    return m('g.panel ' + classes.join('.'), {
      transform: transform
    }, view);
  };

  app.panelView = function(ctrl) {
    return panelView(ctrl.panel, ctrl.x, ctrl.y, ctrl.width);
  };

  global.app = app;
}(this));