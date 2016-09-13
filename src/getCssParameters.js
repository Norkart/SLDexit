var convertCssParameter = require('./convertCssParameter');

function getCssParameters(symbTag, validAttrTag, type, outerTag) {
  var cssArr = [];
  if (outerTag === undefined) {
    var allCssArray = symbTag[0][validAttrTag][0]['CssParameter'];
  } else {
    var allCssArray = symbTag[0][outerTag][0][validAttrTag][0]['CssParameter'];
  }

  var nrOfCssTags = Object.keys(allCssArray).length;
  var j;
  for (j = 0; j < nrOfCssTags; j++) { //for all cssParameters
    var cssTag = allCssArray[j];
    var conv = convertCssParameter(cssTag, validAttrTag, type, outerTag);
    cssArr.push(conv); //array with arrays of cssName and cssValue
  }
  return cssArr;
}

module.exports = getCssParameters;
