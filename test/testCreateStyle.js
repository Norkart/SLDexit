/*eslint-env mocha*/
var assert = require('assert');

var parser = require('../src/parser');
var createStyle = parser.createStyle;


describe('createStyle', function () {
  it('should create a basic style', function () {

    var styleConfig = {
      styleSpecName: 'MapboxGLStyle2',
      sourceName: 'mySource',
      sourceUrl: 'url',
      type: 'vector',
      glyphs: 'glyphs',
      sprite: 'sprite',
      'background-color': 'color'
    };
    var style = createStyle([], styleConfig);

    assert(style);
    assert(style.sources.mySource);
    assert(style.sources.mySource);
    assert.equal(styleConfig.type, style.sources.mySource.type);
    assert.equal(styleConfig.sourceUrl, style.sources.mySource.url);
    assert.equal(styleConfig.styleSpecName, style.name);
    assert.equal(styleConfig.glyphs, style.glyphs);
    assert.equal(styleConfig.sprite, style.sprite);
    assert.equal(styleConfig['background-color'], style.layers[0].paint['background-color']);
  });
});
