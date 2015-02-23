assert = require('assert')
Tile = require('../js/models/tile.js').app.Tile
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


describe 'Tile', ->
  it '#panel', ->
    tile = new Tile(8, 8)
    panel = new Panel()
    tile.panel(2, 3, panel)
    assert.equal(tile.panel(2, 3), panel)

  it '#fix', ->
    tile = new Tile(8, 8)
    panel = new Panel()
    tile.panel(2, 3, panel)
    assert.equal(panel.isFixed(), false)
    tile.fix(2, 3)
    assert.equal(panel.isFixed(), true)

  it '#canFix', ->
    tile = new Tile(8, 8)
    p0 = new Panel(null, true, true, null, null)
    p1 = new Panel(null, null, null, true, null)
    p2 = new Panel(null, null, null, null, true)
    assert.equal(tile.canFix(3, 3, p0), false)
    tile.panel(3, 3, p0)
    assert.equal(tile.canFix(3, 3, p0), false)
    tile.panel(2, 3, p1)
    assert.equal(tile.canFix(3, 3, p0), false)
    tile.panel(3, 4, p2)
    assert.equal(tile.canFix(3, 3), true)

  it '#canJoint', ->
    tile = new Tile(8, 8)
    p0 = new Panel(null, null, true, null, null)
    p1 = new Panel()
    tile.panel(3, 3, p0)
    assert.equal(tile.canJoint(3, 4, p1), false)
    p1.setJoint(null, null, null, true)
    assert.equal(tile.canJoint(3, 4, p1), true)
    tile.panel(3, 4, p1)
    assert.equal(tile.canJoint(3, 4), true)
    p0.setJoint(true, false, false, false)
    p1.setJoint(true, false, false, false)
    assert.equal(tile.canJoint(3, 4), true)

  it '#canJointAnyPosition', ->
    tile = new Tile(4, 4)
    tile.panel(0, 0, new Panel(Panel.COLOR_BROWN))
    tile.panel(0, 1, new Panel(Panel.COLOR_BROWN))
    tile.panel(0, 2, new Panel(Panel.COLOR_BROWN))
    tile.panel(0, 3, new Panel(Panel.COLOR_BROWN))
    tile.panel(1, 0, new Panel(Panel.COLOR_BROWN))
    tile.panel(1, 3, new Panel(Panel.COLOR_BROWN))
    tile.panel(2, 0, new Panel(Panel.COLOR_BROWN))
    tile.panel(2, 3, new Panel(Panel.COLOR_BROWN))
    tile.panel(3, 0, new Panel(Panel.COLOR_BROWN))
    tile.panel(3, 1, new Panel(Panel.COLOR_BROWN))
    tile.panel(3, 2, new Panel(Panel.COLOR_BROWN))
    tile.panel(3, 3, new Panel(Panel.COLOR_BROWN))
    p0 = new Panel(Panel.COLOR_WHITE, true, true, true, true)
    assert.equal(tile.canJointAnyPosition(p0), false)
    p1 = new Panel(Panel.COLOR_WHITE, true, false, false, false)
    assert.equal(tile.canJointAnyPosition(p1), true)
    p2 = new Panel(Panel.COLOR_WHITE, true, false, true, false)
    assert.equal(tile.canJointAnyPosition(p2), false)
    p3 = new Panel(Panel.COLOR_WHITE, true, true, false, false)
    assert.equal(tile.canJointAnyPosition(p3), true)
    assert.equal(tile.canJointAnyPosition([p0, p1]), true)
    assert.equal(tile.canJointAnyPosition([p0, p2]), false)

  it '#isJointed', ->
    tile = new Tile(8, 8)
    p0 = new Panel(null, null, true, null, null)
    p1 = new Panel(null, null, null, null, true)
    tile.panel(3, 3, p0)
    tile.panel(3, 4, p1)
    assert.equal(tile.isJointed(3, 3, 3, 4), true)

  it '#releaseColor', ->
    tile = new Tile(8, 8)
    p0 = new Panel(Panel.COLOR_WHITE, true, true, true, true)
    p1 = new Panel(Panel.COLOR_WHITE, null, null, true, null)
    p2 = new Panel(Panel.COLOR_BLACK, null, null, null, true)
    p3 = new Panel(Panel.COLOR_GRAY, true, null, null, null)
    p4 = new Panel(Panel.COLOR_BLACK, null, true, null, null)
    tile.panel(3, 3, p0)
    tile.panel(2, 3, p1)
    tile.panel(3, 4, p2)
    tile.panel(4, 3, p3)
    tile.panel(3, 2, p4)
    tile.fix(3, 2);
    tile.releaseColor(3, 3)
    assert.equal(p1.color(), Panel.COLOR_WHITE)
    assert.equal(p2.color(), Panel.COLOR_GRAY)
    assert.equal(p3.color(), Panel.COLOR_WHITE)
    assert.equal(p4.color(), Panel.COLOR_BLACK)

  it '#calcChain', ->
    tile = new Tile(8, 8)
    tile.panel(3, 3, new Panel(Panel.COLOR_WHITE, true, true, true, false))
    tile.panel(2, 3, new Panel(Panel.COLOR_WHITE, false, true, true, false))
    tile.panel(3, 4, new Panel(Panel.COLOR_WHITE, true, true, true, true))
    tile.panel(2, 4, new Panel(Panel.COLOR_WHITE, true, true, true, true))
    tile.panel(4, 4, new Panel(Panel.COLOR_BLACK, true, false, false, false))
    tile.panel(1, 4, new Panel(Panel.COLOR_WHITE, false, false, true, false))
    tile.panel(3, 5, new Panel(Panel.COLOR_WHITE, false, false, false, true))
    list = tile.calcChain(3, 3)
    assert.equal(list[0].length, 1)
    assert.equal(list[0][0].row, 3)
    assert.equal(list[0][0].col, 3)
    assert.equal(list[1].length, 2)
    assert.equal(list[2].length, 2)
    assert.equal(list[3].length, 1)

  it '#reset', ->
    tile = new Tile(8, 8)
    panel = new Panel()
    tile.panel(2, 3, panel)
    tile.reset()
    assert.equal(tile.panel(2, 3), null)

  it '#randomEdge', ->
    tile = new Tile(8, 8)
    tile.randomEdge()
    assertHasJoint(tile.panel(0, 0), false, false, false, false)
    assertHasJoint(tile.panel(0, 1), false, false, null, false)
    assertHasJoint(tile.panel(1, 7), false, false, false, null)
    assertHasJoint(tile.panel(7, 6), null, false, false, false)
    assertHasJoint(tile.panel(6, 0), false, null, false, false)