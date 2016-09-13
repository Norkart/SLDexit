var _ = require('underscore');
var xml2js = require('xml2js');

var convertCssName = require('./convertCssName');
var getCssParameters = require('./getCssParameters');
var getObjFromDiffAttr = require('./getObjFromDiffAttr');

var parser = new xml2js.Parser();


var VALID_SYMBOLIZERS = [
  'LineSymbolizer',
  'TextSymbolizer',
  'PolygonSymbolizer',
  'PointSymbolizer'
];

var VALID_ATTR_TAGS = [
  'Stroke',
  'Fill',
  'Label',
  'Font',
  'Halo',
  'Mark',
  'Size',
  'Geometry',
  'Graphic'
];
//attribute-tags that must be handeled different than the rest
var DIFF_ATTR_TAG = ['Label', 'Halo', 'Mark', 'Geometry', 'Graphic'];

//mapping from sld symbolizer til mapbox GL type-attribute
var CONV_TYPE = {
  'LineSymbolizer': 'line',
  'PolygonSymbolizer': 'fill',
  'TextSymbolizer': 'symbol',
  'PointSymbolizer': 'symbol'
};



//attrbiutes that belongs to the paint-object in Mapbox gl
var PAINT_ATTR = [
  'line-color', 'line-width', 'line-dasharray', 'line-opacity',
  'text-color', 'text-halo-color', 'text-halo-width', 'text-halo-blur', 'text-size',
  'fill-color', 'fill-opacity', 'fill-image',
  'icon-color', 'icon-opacity', 'icon-size'
];

//attributes that belongs to the layout-object in Mapbox gl
var LAYOUT_ATTR = [
  'text-field', 'text-font', 'text-max-size', 'text-max-witdth',
  'line-join', 'symbol-placement', 'icon-image'
];








function createStyle(layers, styleConfig) {

  var sources = {};
  sources[styleConfig.sourceName] = {'type': styleConfig.type, 'url': styleConfig.sourceUrl};
  var style = {
    'version': 7,
    'name': styleConfig.styleSpecName,
    'sources': sources,
    'glyphs': styleConfig.glyphs,
    'sprite': styleConfig.sprite,
    'layers': [{
      'id': 'background',
      'type': 'background',
      'paint': {'background-color': styleConfig['background-color']}
    }]
  };

  style.layers = style.layers.concat(layers);
  return style;
}


//translate zoom-scale to zoom-level
function scaleToZoom(scale) {
  if (scale > 500000000) {
    return 0;
  }
  if (scale > 250000000) {
    return 1;
  }
  if (scale > 150000000) {
    return 2;
  }
  if (scale > 70000000) {
    return 3;
  }
  if (scale > 35000000) {
    return 4;
  }
  if (scale > 15000000) {
    return 5;
  }
  if (scale > 10000000) {
    return 6;
  }
  if (scale > 4000000) {
    return 7;
  }
  if (scale > 2000000) {
    return 8;
  }
  if (scale > 1000000) {
    return 9;
  }
  if (scale > 500000) {
    return 10;
  }
  if (scale > 250000) {
    return 11;
  }
  if (scale > 150000) {
    return 12;
  }
  if (scale > 70000) {
    return 13;
  }
  if (scale > 35000) {
    return 14;
  }
  if (scale > 15000) {
    return 15;
  }
  if (scale > 8000) {
    return 16;
  }
  if (scale > 4000) {
    return 17;
  }
  if (scale > 2000) {
    return 18;
  }
  if (scale > 1000) {
    return 19;
  }
  return 20;
}

function parseMultipleSlds(styles, callback) {

    var parsed = [];
    var finished = _.after(styles.length, function () {
      callback(null, parsed);
    });

    _.each(styles, function (style) {
      parseSld(style.sld, style.filename, function (err, result) {
        if (err) {
          callback(err);
        } else {
          parsed = parsed.concat(result);
          finished();
        }
      });
    });
}

function parseSld(data, filename, callback) {
  parser.parseString(data, function (err, result) {
      var FeatureTypeStyle = result.StyledLayerDescriptor.NamedLayer[0].UserStyle[0].FeatureTypeStyle;
      var rulesArr = [];
      var k;
      var rules = [];
      for (k = 0; k < FeatureTypeStyle.length; k++) { //some files had more than one FeatureTypeStyle
        var rulesVer = (FeatureTypeStyle[k].Rule);
        var rule;
        for (rule = 0; rule < rulesVer.length; rule++) {
          //pushes all rules-tag in different FeatureTypeStyle-tags to one array
          rules.push(rulesVer[rule]);
        }
      }
      var j;
      var maxzoom;
      var minzoom;
      var res = [];
      for (j = 0; j < rules.length; j++) {
        rule = rules[j];
        var name = rule.Name[0];
        maxzoom = scaleToZoom(rule.MaxScaleDenominator[0]);
        minzoom = scaleToZoom(rule.MinScaleDenominator[0]);

        //Checks if the tag is valid, and if it is: saves the object and type-name
        var i;
        var ruleArray = Object.keys(rule);
        for (i = 0; i < ruleArray.length; i++) {
          if ((VALID_SYMBOLIZERS.indexOf(ruleArray[i])) > -1) {
            //Sends object, symbolizer and filename
            try {
              res.push(writeJSON(rule[ruleArray[i]], ruleArray[i], name, minzoom, maxzoom, filename));
            } catch (e) {
              console.log(e);
            }
          }
        }
      }
      callback(null, res);
    });
}

//called for each symbolizer
//this runs the rest of the methods through makeJSON and so on, and writes the objects to file
function writeJSON(symbTag, type, name, minzoom, maxzoom, filename) {
  //console.log(type, name)
  var errorFiles = [];
  var convType = convertType(type);
  try {
    var cssObj = getSymbolizersObj(symbTag, type, filename);
    //if css-obj contains both fill and stroke, you have to split them into two layers
    if (cssObj['fill-color'] !== undefined && cssObj['line-color'] !== undefined) {
      var attPos = (Object.keys(cssObj)).indexOf('line-color');
      var i;
      var obj = {};
      var size = ((Object.keys(cssObj)).length);
      for (i = attPos; i < (size); i++) {
        //since i delete for each loop, it will always be this position
        var key = Object.keys(cssObj)[attPos];
        obj[key] = cssObj[key];
        delete cssObj[key];
      }
      var styleObj1 = makeJSON(name, convType, cssObj, minzoom, maxzoom);
      var styleObj2 = makeJSON(name, 'line', obj, minzoom, maxzoom);
      console.log('Writing converted');
      return [styleObj1, styleObj2];
    } else {
      var styleObj = makeJSON(name, convType, cssObj, minzoom, maxzoom);
      return styleObj;
    }
  } catch (err) {
    throw new Error(filename + '-' + name);
  }
}

//this makes the layout of each mapbox-layout-object
//name=file name, css is an object [cssName: cssValue]pairs, cssName is ie stroke, stroke-width
function makeJSON(name, type, cssObj, minzoom, maxzoom) {
  var attr = getPaintAndLayoutAttr(cssObj);
  var paint = attr[0];
  var layout = attr[1];

  //Removing default-values, they are redundant
  if (Object.keys(paint).indexOf('fill-opacity') > -1) {
    if (paint['fill-opacity'] === 1) {
      delete paint['fill-opacity'];
    }
  }

  var styleObj = {
    'id': type + '-' + name,
    'type': type,
    'source': 'norkart',
    'source-layer': name,
    'minzoom': maxzoom,
    'maxzoom': minzoom,
    'layout': layout,
    'paint': paint
  };
  if (!Object.keys(layout).length > 0) { //if no layout attributes
    delete styleObj['layout'];
  }
  return styleObj;
}


function getSymbolizersObj(symbTag, type, file) {
  //have to check all taggs in symbolizer
  var i;
  var cssObj = {};
  for (i = 0; i < Object.keys(symbTag[0]).length; i++) { //for all tags under <-Symbolizer>
    var tagName = Object.keys(symbTag[0])[i];
    if (VALID_ATTR_TAGS.indexOf(tagName) > -1) {  //if tag exists in valid-array, eks Stroke

       //if values are not in the regular place
      if (DIFF_ATTR_TAG.indexOf(tagName) > -1 ||
          ((tagName === 'Fill') && symbTag[0].Fill[0].GraphicFill !== undefined)) {
        var obj = getObjFromDiffAttr(tagName, type, symbTag, file);
        for (var key in obj) {
          cssObj[key] = obj[key];
        }
      } else {//if common cssParameterTags
        //array with key-value pairs to add to cssObj
        var cssArray = getCssParameters(symbTag, tagName, type);
        var k;
        for (k = 0; k < cssArray.length; k++) {
          cssObj[cssArray[k][0]] = cssArray[k][1];
        }
      }
    } else if (tagName !== undefined) {
      //console.log(tagName+" is not a valid attribute tag");
    }
  }
  return cssObj;
}

function convertType(type) {
  try {
    return CONV_TYPE[type];
  } catch (err) {
    console.log('could not convert the type: ' + type);
  }
}

//Makes paint object and layout object
function getPaintAndLayoutAttr(cssObj) {
  var paint = {};
  var layout = {};
  var i;
  for (i = 0; i < Object.keys(cssObj).length; i++) {// for all in cssObj
    var key = Object.keys(cssObj)[i];//becomes line-color
    var value = cssObj[key];
    if (PAINT_ATTR.indexOf(key) > -1) {
      paint[key] = value;
    } else if (LAYOUT_ATTR.indexOf(key) > -1) {
      layout[key] = value;
    } else {
      console.log('The css-key: ' + key + ', is not a valid paint or layout attribute');
    }
  }
  return [paint, layout];
}

module.exports = {
  parseMultipleSlds: parseMultipleSlds,
  parseSld: parseSld,
  createStyle: createStyle
};
