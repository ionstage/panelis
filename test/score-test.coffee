assert = require('assert')
Score = require('../js/models/score.js').app.Score


describe 'Score', ->

  it '#add', ->
    score = new Score(red: 1, yellow: 2, green: 3)
    score.add(Score.COLOR_RED, 3)
    score.add(Score.COLOR_YELLOW, 4)
    score.add(Score.COLOR_GREEN, 5)
    assert.equal(score.red(), 4)
    assert.equal(score.yellow(), 6)
    assert.equal(score.green(), 8)

  it '#reset', ->
    score = new Score(red: 1, yellow: 2, green: 3)
    score.add(Score.COLOR_RED, 3)
    score.add(Score.COLOR_YELLOW, 4)
    score.add(Score.COLOR_GREEN, 5)
    score.reset()
    assert.equal(score.red(), 0)
    assert.equal(score.yellow(), 0)
    assert.equal(score.green(), 0)

  it '#total', ->
    score = new Score(red: 1, yellow: 2, green: 3)
    assert.equal(score.total(), 1100)