//mapping from sld to mapbox
var CONVERT_ATTR_NAME = {
    'stroke': 'line-color',
    'stroke-width': 'line-width',
    'stroke-dasharray': 'line-dasharray',
    'stroke-linejoin': 'line-join',
    'opacity': 'line-opacity',
    'PolygonSymbolizer-Fill-fill': 'fill-color',
    'PolygonSymbolizer-Fill-fill-opacity': 'fill-opacity',
    'PolygonSymbolizer-Fill-opacity': 'fill-opacity',
    'font-size': 'text-size',
    'font-family': 'text-font',
    'Label': 'text-field',
    'TextSymbolizer-Halo-Fill-fill': 'text-halo-color',
    'TextSymbolizer-Fill-fill': 'text-color'
};


function convertCssName(cssName, validAttrTag, type, outerTag) {
  var newName;
  if (cssName === 'fill'
    || cssName === 'fill-opacity'
    || cssName === 'opacity'
    && validAttrTag === 'Fill') {
    if (outerTag === undefined) {
      newName = CONVERT_ATTR_NAME[type + '-' + validAttrTag + '-' + cssName];

    } else {
      var newName = CONVERT_ATTR_NAME[type + '-' + outerTag + '-' + validAttrTag + '-' + cssName];
      if (newName === undefined) {
        console.log(
          'could not convert the attribute name: ' + type + '-' +
          outerTag + '-' + validAttrTag + '-' + cssName
        );
      }
    }
    return newName;
  } else {
    var newName = CONVERT_ATTR_NAME[cssName];
    //List to print those I know cannot be translated
    var ACCEPTED = ['font-weight', 'font-style'];
    //skip printing the ones I know are not translated
    if (newName === undefined && ACCEPTED.indexOf(newName) > -1) {
      console.log('could not convert the attribute name: ' + cssName);
    }
    return newName;
  }
}

module.exports = convertCssName;
