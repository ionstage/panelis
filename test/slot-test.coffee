assert = require('assert')
Slot = require('../js/models/slot.js').app.Slot
Panel = require('../js/models/panel.js').app.Panel


describe 'Slot', ->

  it '#panel', ->
    p0 = new Panel()
    p1 = new Panel()
    p2 = new Panel()
    slot = new Slot([p0, p1, p2], Panel.COLOR_WHITE)
    assert.equal(slot.panel(0), p0)
    p3 = new Panel()
    slot.panel(1, p3)
    assert.equal(slot.panel(1), p3)

  it '#selectedIndex', ->
    p0 = new Panel()
    p1 = new Panel()
    p2 = new Panel()
    slot = new Slot([p0, p1, p2], Panel.COLOR_WHITE)
    assert.equal(slot.selectedIndex(), -1)
    slot.selectedIndex(1)
    assert.equal(slot.selectedIndex(), 1)

  it '#supply', ->
    p0 = new Panel()
    p1 = new Panel()
    p2 = new Panel()
    slot = new Slot([p0, p1, p2], Panel.COLOR_WHITE)
    slot.panel(1, null)
    slot.supply()
    assert.notEqual(slot.panel(1), null)