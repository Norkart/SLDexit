/*eslint-env mocha*/
var assert = require('assert');
var fs = require('fs');

var parser = require('../src/parser');
var parseSld = parser.parseSld;


describe('parseSld', function () {
  it('should parse a single sld', function () {

    var filename = 'FKB_ElvBekk.xml';
    var data = fs.readFileSync('./exampleMultipleLayers/' + filename);

    parseSld(data, filename, function (err, styles) {
      assert(styles);
      assert.equal(2, styles.length);
      assert.equal('line-FKB_ElvBekk_midtlinje', styles[0].id);
      assert.equal('line', styles[0].type);
      assert.equal(16, styles[0].minzoom);
      assert.equal(20, styles[0].maxzoom);
      assert.equal('#87BEF1', styles[0].paint['line-color']);
      assert.equal(0.1, styles[0].paint['line-width']);
    });
  });
});
