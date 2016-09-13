//Makes sure the attribute values are returned in the correct type and defined
//correctly (ie colors with a # in front)
function convertCssValue(cssValue, cssName) {

  //linejoin describes rendering with values; mitre/round/bevel
  if ((cssName === 'stroke' || cssName === 'stroke-linejoin' || cssName === 'stroke-linecap')) {
    //some colors are defined with #, others not.
    return '#' + cssValue.replace('#', '');
  }

  if (cssName === 'stroke-width'
    || cssName === 'stroke-opacity'
    || cssName === 'stroke--dashoffset') {
    return parseFloat(cssValue);
  }
  if (cssName === 'stroke-dasharray') {
    return cssValue.split(' ').map(Number);
  }

  if (cssName === 'fill') {
    //some colors are defined with #, others not.
    return '#' + cssValue.replace('#', '');
  }

  if (cssName === 'opacity' || cssName === 'fill-opacity') {
    return parseFloat(cssValue);
  }

  if (cssName === 'font-size') {
    return parseFloat(cssValue);
  }

  return cssValue;

}

module.exports = convertCssValue;
