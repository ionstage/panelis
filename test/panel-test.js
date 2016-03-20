var assert = require('assert');
var Panel = require('../js/models/panel.js');

var assertJoint = function(panel, jointTop, jointRight, jointBottom, jointLeft) {
  if (jointTop !== null)
    assert.equal(panel.jointTop(), jointTop);
  if (jointRight !== null)
    assert.equal(panel.jointRight(), jointRight);
  if (jointBottom !== null)
    assert.equal(panel.jointBottom(), jointBottom);
  if (jointLeft !== null)
    assert.equal(panel.jointLeft(), jointLeft);
};

describe('Panel', function() {
  it('#mixColor', function() {
    var panel = new Panel({
      color: Panel.COLOR_BLACK
    });
    panel.mixColor(Panel.COLOR_WHITE);
    assert.equal(panel.color(), Panel.COLOR_GRAY);
  });

  it('#eachJoint', function() {
    var panel = new Panel({
      jointTop: true,
      jointBottom: true
    });
    var joints = [];
    panel.eachJoint(function(joint) {
      joints.push(joint);
    });
    assert.equal(joints.length, 2);
  });

  it('#rotate', function() {
    var panel = new Panel({
      jointTop: true,
      jointBottom: true
    });
    panel.rotate();
    assertJoint(panel, false, true, false, true);
  });

  it('#resetRotation', function() {
    var panel = new Panel({
      jointTop: true
    });
    panel.rotate();
    panel.rotate();
    panel.resetRotation();
    assertJoint(panel, true, false, false, false);
  });

  it('#clone', function() {
    var orig = new Panel({
      color: Panel.COLOR_WHITE,
      jointTop: true,
      jointBottom: true,
      isFixed: true
    });
    var clone = orig.clone();
    assert(clone !== orig);
    assert.equal(clone.color(), orig.color());
    assertJoint(clone, orig.jointTop(), orig.jointRight(), orig.jointBottom(), orig.jointLeft());
    assert.equal(clone.isFixed(), orig.isFixed());
  });

  it('::sample', function() {
    var p0 = Panel.sample(Panel.COLOR_WHITE);
    assert.equal(p0.color(), Panel.COLOR_WHITE);
    var p1 = Panel.sample(Panel.COLOR_BROWN, Panel.JOINT_BOTTOM);
    assertJoint(p1, false, false, null, false);
  });
});