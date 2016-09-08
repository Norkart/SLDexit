var fs = require('fs');
var program = require('commander');

var fileReader = require('./src/fileReader');
var createStyle = require('./src/parser').createStyle;


program
  .version('1.0.0')
  .usage('[options] <input> <output>')
  .option('-c, --config [value]', 'path to style config')
  .parse(process.argv);

if (program.args.length < 1) {
  console.error('Specify input file or directory');
  process.exit(1);
}

var input = program.args[0];
var output = program.args[1] || 'style.json';

var singleFile;
try {
  if (fs.lstatSync(input).isDirectory()) {
    singleFile = false;
  } else if (fs.lstatSync(input).isFile()) {
    singleFile = true;
  }
} catch (e) {
    console.error('Input is not file or directory');
    process.exit(1);
}

var styleConfig;
if (program.config) {
  try {
    styleConfig = JSON.parse(fs.readFileSync(program.config));
  } catch (e) {
    console.error('Invalid style config');
    process.exit(1);
  }
} else {
  styleConfig = JSON.parse(fs.readFileSync('./styleConfig.json'));
}


function filesParsed(err, layers) {
  var style = createStyle(layers, styleConfig);
  fs.writeFile(output, JSON.stringify(style, null, 4));
}

if (singleFile) {
  fileReader.parseSingleFile(input, filesParsed);
} else {
  fileReader.parseMultipleFiles(input, filesParsed);
}
