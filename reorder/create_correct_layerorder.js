var fs = require('fs');
var _us = require('underscore');

var json_file_name = "json-test.json";  //original json file
var ordering_file_name = "layers_ordering.txt"; // file containing
var output_filename = "json_style_ordered.json"; // name of the output file

function main() {
  var json_original_style = JSON.parse(fs.readFileSync(json_file_name, 'utf8'));
  var ordering_file = fs.readFileSync(ordering_file_name, 'utf8');

  if (ordering_file.indexOf('\r\n') !== -1) {
   ordering_list = ordering_file.split('\r\n');
  }
  else {
    ordering_list = ordering_file.split('\n');
  }

  if (ordering_list[ordering_list.length-1] === "") { // last line is usualy empty
    ordering_list.splice(ordering_list.length - 1, ordering_list.length)
  }

  var json_ordered_style = {
    "version": json_original_style.version,
    "name": json_original_style.name,
    "sources": json_original_style.sources,
    "glyphs": json_original_style.glyphs,
    "sprite": json_original_style.sprite,
    "layers":[]
  };
  // console.log(JSON.stringify(json_ordered_style,null,2));

  for (var i = 0; i < ordering_list.length; i++) {
    json_ordered_style.layers.push(get_layer_by_id(json_original_style, ordering_list[i]));
  }
  // add min max zoom for testing once..

  fs.writeFileSync(output_filename, JSON.stringify(json_ordered_style, null, 2)); // resets file

  console.log("Is in same order as " + ordering_file_name + ": " +check_order(ordering_list, output_filename));
}


function check_order(order,created_file) {
  var json_created = JSON.parse(fs.readFileSync(created_file, 'utf8'));

  for (var i = 0; i < order.length; i++) {
    if (order[i] !== json_created.layers[i].id) {
      return false;
    }
  }
  return true;
}

function get_layer_by_id(json, layerid) {
  var i;
  for(i=0; i < json.layers.length; i++){
    // console.log(json.layers[i].id + "(" + json.layers[i].id.length + ")");
    // console.log(layerid + "(" + layerid.length + ")");

    if (json.layers[i].id === layerid){
      return json.layers[i];
    }
  }
  throw {name:"cantFindLayer", message:("can't find the wanted layerid: " + layerid)};
}

main();
