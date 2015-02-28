assert = require('assert')
Panel = require('../js/models/panel.js').app.Panel

assertHasJoint = (panel, top, right, bottom, left) ->
  if top != null
    assert.equal(panel.hasJoint(Panel.JOINT_TOP), top)
  if right != null
    assert.equal(panel.hasJoint(Panel.JOINT_RIGHT), right)
  if bottom != null
    assert.equal(panel.hasJoint(Panel.JOINT_BOTTOM), bottom)
  if left != null
    assert.equal(panel.hasJoint(Panel.JOINT_LEFT), left)


describe 'Panel', ->

  it '#color', ->
    panel = new Panel(Panel.COLOR_BLACK)
    assert.equal(panel.color(), Panel.COLOR_BLACK)

  it '#isFixed', ->
    panel = new Panel()
    panel.isFixed(true)
    assert.equal(panel.isFixed(), true)

  it '#mixColor', ->
    panel = new Panel(Panel.COLOR_BLACK)
    panel.mixColor(Panel.COLOR_WHITE)
    assert.equal(panel.color(), Panel.COLOR_GRAY)

  it '#hasJoint', ->
    panel = new Panel()
    [
      Panel.JOINT_TOP,
      Panel.JOINT_RIGHT,
      Panel.JOINT_LEFT,
      Panel.JOINT_BOTTOM
    ].forEach (position) ->
      panel.hasJoint(position, true)
      assert.equal(panel.hasJoint(position), true)

  it '#setJoint', ->
    panel = new Panel()
    panel.setJoint(true, null, true, false)
    assertHasJoint(panel, true, false, true, false)

  it '#rotate', ->
    panel = new Panel()
    panel.setJoint(true, false, true, false)
    panel.rotate()
    assertHasJoint(panel, false, true, false, true)

  it '#resetRotation', ->
    panel = new Panel()
    panel.setJoint(true, false, false, false)
    panel.rotate()
    panel.rotate()
    panel.resetRotation()
    assertHasJoint(panel, true, false, false, false)

  it '#clone', ->
    orig = new Panel(Panel.COLOR_WHITE, true, false, true, false, true)
    clone = orig.clone()
    assert(clone != orig)
    assert.equal(clone.color(), orig.color())
    assert.equal(clone.isFixed(), orig.isFixed())
    [
      Panel.JOINT_TOP,
      Panel.JOINT_RIGHT,
      Panel.JOINT_LEFT,
      Panel.JOINT_BOTTOM
    ].forEach (position) ->
      assert.equal(clone.hasJoint(position), orig.hasJoint(position))

  it '::sample', ->
    p0 = Panel.sample(Panel.COLOR_WHITE)
    assert.equal(p0.color(), Panel.COLOR_WHITE)
    p1 = Panel.sample(Panel.COLOR_BROWN, Panel.JOINT_BOTTOM)
    assertHasJoint(p1, false, false, null, false)