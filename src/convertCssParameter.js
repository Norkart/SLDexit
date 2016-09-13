var convertCssName = require('./convertCssName');
var convertCssValue = require('./convertCssValue');

//attributes that must be handeled different than the rest,
//and has relevant info placed differently (inner tag)
var DIFF_ATTR = ['stroke', 'opacity', 'fill', 'fill-opacity', 'font-size', 'stroke-width'];

//returns an array with css parameter name and value, correctly converted
//validAttrTag=name of outer tag, example stroke, fill, label
function convertCssParameter(cssTag, ValidAttrTag, type, outerTag) {
  var cssName = cssTag['$'].name;
  var cssValue;
  var regLetters = /^[a-zA-Z]+$/;
  var regInt = /^\d+$/;
  var regDouble = /^[0-9]+([\,\.][0-9]+)?$/g;
  var regNumbers = /^\d+$/;

  try {
    var cssColorValue = cssTag['_'].split('#')[1];
    //testing if the value is a color:
    if ((DIFF_ATTR.indexOf(cssName)) > -1
      && !(regInt.test(cssTag['_']))
      && !(regDouble.test(cssTag['_']))
      && !regLetters.test(cssColorValue)
      && !regNumbers.test(cssColorValue) ) {//Check if different type of attribute
      cssValue = (cssTag['ogc:Function'][0]['ogc:Literal'][1]);
    } else {
      cssValue = cssTag['_'];
    }
  } catch (err) {
    if ((DIFF_ATTR.indexOf(cssName)) > -1
      && !(regInt.test(cssTag['_']))
      && !(regDouble.test(cssTag['_']))) {//Check if different type of attribute
      cssValue = (cssTag['ogc:Function'][0]['ogc:Literal'][1]);
    } else {
      cssValue = cssTag['_'];
    }
  }
  var convertedCssName = convertCssName(cssName, ValidAttrTag, type, outerTag);
  var convertedCssValue = convertCssValue(cssValue, cssName);
  return [convertedCssName, convertedCssValue];
}

module.exports = convertCssParameter;
