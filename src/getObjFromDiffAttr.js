var convertCssName = require('./convertCssName');
var getCssParameters = require('./getCssParameters');


var PUNKT = 'circle-12'; //?

//get the icon-image
var CONV_ICON_IMG = {
  'FKB_Gravplass.xml': 'religious-christian-12',
  'FKB_BautaStatue.xml': 'monument-12',
  'FKB_Bensinpumpe.xml': 'fuel-24',
  'FKB_Broenn.xml': '',
  'FKB_Kum.xml': 'circle-stroked-24'
  //, 'FKB_MastTele':,'FKB_Mast_Telesmast'
};

function getIconImage(file) {
  try {
    var img = CONV_ICON_IMG[file];
  } catch (err) {
    console.log('Unknown icon');
    img = undefined;
  }
  return img;
}

function getFillObj(tagName, type, symbTag) {
  var obj = {};
  obj['fill-image'] = 'SPRITE-NAME';
  return obj;
}

function getLabelObj(tagName, type, symbTag) {
  var obj = {};
  var convertedTagName = convertCssName(tagName, tagName, type);
  obj[convertedTagName] = '{' + symbTag[0].Label[0]['ogc:PropertyName'][0] + '}';
  return obj;
}

function getHaloObj(tagName, type, symbTag) {
  var obj = {};
  var j;
  for (j = 0; j < Object.keys(symbTag[0].Halo[0]).length; j++) {
    var innerTagName = (Object.keys(symbTag[0].Halo[0]))[j];

    if (innerTagName === 'Radius') {
      var value = symbTag[0].Halo[0]['Radius'][0]['ogc:Literal'][0];
      obj['text-halo-width'] = parseInt(value, 10);
    } else if (innerTagName === 'Fill') {
      //array with key-value pair to add in obj
      var cssArray = getCssParameters(symbTag, innerTagName, type, 'Halo');
      var k;
      for (k = 0; k < cssArray.length; k++) {
        obj[cssArray[k][0]] = cssArray[k][1];
      }
    } else {
      console.log('translation of: ' + innerTagName + ' is not added');
    }
  }
  return obj;
}

function getGeometryObj(tagName, type, symbTag, file) {
  var obj = {};
  if (symbTag[0].Geometry[0]['ogc:Function'][0].$.name === 'vertices') {
    obj['icon-image'] = PUNKT;
  } else {
    console.log('Cannot convert attribute value: ' + symbTag[0].Geometry[0]['ogc:Function'][0].$.name + ', for tag Geometry');
  }
  return obj;
}

function getGraphicObj(tagName, type, symbTag, file) {
  var obj = {};
  var fillColor;
  try {
    fillColor = symbTag[0].Graphic[0].Mark[0].Fill[0].CssParameter[0]['ogc:Function'][0]['ogc:Literal'][1];
    var color = '#' + fillColor;
    var regInteger = /^\d+$/;
    if (!regInteger.test(fillColor)) {
      //console.log('Different graphic tag: '+fillColor+ ' from file: '+ file);
    } else {
      obj['icon-color'] = color;
    }
  } catch (err) {
    console.log('Could not set fill color for graphic tag in file: ' + file);
  }
  //Sets size
  try {
    var size = symbTag[0].Graphic[0].Size[0];
      obj['icon-size'] = parseInt(size, 10);
  } catch (err) {
      console.log('Size does not exist in this graphic-tag');
  }
  var img = getIconImage(file);
  if (img !== undefined) {
    obj['icon-image'] = img;
  } else {
    obj['icon-image'] = 'circle-12';
  }
  return obj;
}

//gets called if attribute-values are not placed as the rest and therefor needs
//a different method the get the css-value
function getObjFromDiffAttr(tagName, type, symbTag, file) {
  //var obj = {};
  if (tagName === 'Label') {
    return getLabelObj(tagName, type, symbTag, file);
  } else if (tagName === 'Fill') { //some fill-attributes are defined differently than the rest
    return getFillObj(tagName, type, symbTag, file);
  } else if (tagName === 'Halo') {
    return getHaloObj(tagName, type, symbTag, file);
  } else if (tagName === 'Geometry') {
    return getGeometryObj(tagName, type, symbTag, file);
  } else if (tagName === 'Graphic') {
    return getGraphicObj(tagName, type, symbTag, file);
  } else if (tagName === 'Mark') {
    return {};
  }
  return {};
}


module.exports = getObjFromDiffAttr;
