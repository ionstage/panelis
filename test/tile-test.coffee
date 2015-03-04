assert = require('assert')
Tile = require('../js/models/tile.js').app.Tile
Panel = require('../js/models/panel.js').app.Panel

assertJoint = (panel, jointTop, jointRight, jointBottom, jointLeft) ->
  if jointTop != null
    assert.equal(panel.jointTop(), jointTop)
  if jointRight != null
    assert.equal(panel.jointRight(), jointRight)
  if jointBottom != null
    assert.equal(panel.jointBottom(), jointBottom)
  if jointLeft != null
    assert.equal(panel.jointLeft(), jointLeft)


describe 'Tile', ->
  it '#panel', ->
    tile = new Tile(rowLength: 8, colLength: 8)
    panel = new Panel(color: Panel.COLOR_BROWN)
    tile.panel(2, 3, panel)
    assert.equal(tile.panel(2, 3), panel)

  it '#fix', ->
    tile = new Tile(rowLength: 8, colLength: 8)
    panel = new Panel(color: Panel.COLOR_BROWN)
    tile.panel(2, 3, panel)
    assert.equal(panel.isFixed(), false)
    tile.fix(2, 3)
    assert.equal(panel.isFixed(), true)

  it '#canFix', ->
    tile = new Tile(rowLength: 8, colLength: 8)
    p0 = new Panel(jointTop: true, jointRight: true)
    p1 = new Panel(jointBottom: true)
    p2 = new Panel(jointLeft: true)
    assert.equal(tile.canFix(3, 3, p0), false)
    tile.panel(3, 3, p0)
    assert.equal(tile.canFix(3, 3, p0), false)
    tile.panel(2, 3, p1)
    assert.equal(tile.canFix(3, 3, p0), false)
    tile.panel(3, 4, p2)
    assert.equal(tile.canFix(3, 3), true)

  it '#canJoint', ->
    tile = new Tile(rowLength: 8, colLength: 8)
    p0 = new Panel(jointRight: true)
    p1 = new Panel(color: Panel.COLOR_BROWN)
    tile.panel(3, 3, p0)
    assert.equal(tile.canJoint(3, 4, p1), false)
    p1 = new Panel(jointLeft: true)
    assert.equal(tile.canJoint(3, 4, p1), true)
    tile.panel(3, 4, p1)
    assert.equal(tile.canJoint(3, 4), true)
    p0 = new Panel(jointTop: true)
    p1 = new Panel(jointTop: true)
    tile.panel(3, 3, p0)
    tile.panel(3, 4, p1)
    assert.equal(tile.canJoint(3, 4), true)

  it '#canJointAnyPosition', ->
    tile = new Tile(rowLength: 4, colLength: 4)
    tile.panel(0, 0, new Panel(color: Panel.COLOR_BROWN))
    tile.panel(0, 1, new Panel(color: Panel.COLOR_BROWN))
    tile.panel(0, 2, new Panel(color: Panel.COLOR_BROWN))
    tile.panel(0, 3, new Panel(color: Panel.COLOR_BROWN))
    tile.panel(1, 0, new Panel(color: Panel.COLOR_BROWN))
    tile.panel(1, 3, new Panel(color: Panel.COLOR_BROWN))
    tile.panel(2, 0, new Panel(color: Panel.COLOR_BROWN))
    tile.panel(2, 3, new Panel(color: Panel.COLOR_BROWN))
    tile.panel(3, 0, new Panel(color: Panel.COLOR_BROWN))
    tile.panel(3, 1, new Panel(color: Panel.COLOR_BROWN))
    tile.panel(3, 2, new Panel(color: Panel.COLOR_BROWN))
    tile.panel(3, 3, new Panel(color: Panel.COLOR_BROWN))
    p0 = new Panel(color: Panel.COLOR_WHITE, jointTop: true, jointRight: true, jointBottom: true, jointLeft: true)
    assert.equal(tile.canJointAnyPosition(p0), false)
    p1 = new Panel(color: Panel.COLOR_WHITE, jointTop: true)
    assert.equal(tile.canJointAnyPosition(p1), true)
    p2 = new Panel(color: Panel.COLOR_WHITE, jointTop: true, jointBottom: true)
    assert.equal(tile.canJointAnyPosition(p2), false)
    p3 = new Panel(color: Panel.COLOR_WHITE, jointTop: true, jointRight: true)
    assert.equal(tile.canJointAnyPosition(p3), true)
    assert.equal(tile.canJointAnyPosition([p0, p1]), true)
    assert.equal(tile.canJointAnyPosition([p0, p2]), false)

  it '#isJointed', ->
    tile = new Tile(rowLength: 8, colLength: 8)
    p0 = new Panel(jointRight: true)
    p1 = new Panel(jointLeft: true)
    tile.panel(3, 3, p0)
    tile.panel(3, 4, p1)
    assert.equal(tile.isJointed(3, 3, 3, 4), true)

  it '#releaseColor', ->
    tile = new Tile(rowLength: 8, colLength: 8)
    p0 = new Panel(color: Panel.COLOR_WHITE, jointTop: true, jointRight: true, jointBottom: true, jointLeft: true)
    p1 = new Panel(color: Panel.COLOR_WHITE, jointBottom: true)
    p2 = new Panel(color: Panel.COLOR_BLACK, jointLeft: true)
    p3 = new Panel(color: Panel.COLOR_GRAY, jointTop: true)
    p4 = new Panel(color: Panel.COLOR_BLACK, jointRight: true)
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
    tile = new Tile(rowLength: 8, colLength: 8)
    tile.panel(3, 3, new Panel(color: Panel.COLOR_WHITE, jointTop: true, jointRight: true, jointBottom: true))
    tile.panel(2, 3, new Panel(color: Panel.COLOR_WHITE, jointRight: true, jointBottom: true))
    tile.panel(3, 4, new Panel(color: Panel.COLOR_WHITE, jointTop: true, jointRight: true, jointBottom: true, jointLeft: true))
    tile.panel(2, 4, new Panel(color: Panel.COLOR_WHITE, jointTop: true, jointRight: true, jointBottom: true, jointLeft: true))
    tile.panel(4, 4, new Panel(color: Panel.COLOR_BLACK, jointTop: true))
    tile.panel(1, 4, new Panel(color: Panel.COLOR_WHITE, jointBottom: true))
    tile.panel(3, 5, new Panel(color: Panel.COLOR_WHITE, jointLeft: true))
    list = tile.calcChain(3, 3)
    assert.equal(list[0].length, 1)
    assert.equal(list[0][0].row, 3)
    assert.equal(list[0][0].col, 3)
    assert.equal(list[1].length, 2)
    assert.equal(list[2].length, 2)
    assert.equal(list[3].length, 1)

  it '#reset', ->
    tile = new Tile(rowLength: 8, colLength: 8)
    panel = new Panel(color: Panel.COLOR_BROWN)
    tile.panel(2, 3, panel)
    tile.reset()
    assert.equal(tile.panel(2, 3), null)

  it '#randomEdge', ->
    tile = new Tile(rowLength: 8, colLength: 8)
    tile.randomEdge()
    assertJoint(tile.panel(0, 0), false, false, false, false)
    assertJoint(tile.panel(0, 1), false, false, null, false)
    assertJoint(tile.panel(1, 7), false, false, false, null)
    assertJoint(tile.panel(7, 6), null, false, false, false)
    assertJoint(tile.panel(6, 0), false, null, false, false)