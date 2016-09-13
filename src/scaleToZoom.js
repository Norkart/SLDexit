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
module.exports = scaleToZoom;
