var _ = require('underscore');
var fs = require('fs');

var parser = require('./parser');

var parseSld = parser.parseSld;
var parseMultipleSlds = parser.parseMultipleSlds;

function parseSingleFile(filename, callback) {
  var data;
  try {
    data = fs.readFileSync(filename);
  } catch (err) {
    if (err.code !== 'ENOENT') {
      throw err;
    }
    console.log(err);
    callback(err);
  }

  parseSld(data, filename, callback);
};


function parseMultipleFiles(path, callback) {
    var files;
    try {
      files = fs.readdirSync(path);
    } catch (err) {
      if (err.code !== 'ENOENT') {
        throw err;
      }
      console.log(err);
      callback(err);
    }

    var styles = _.map(files, function (filename) {
      var data;
      try {
        data = fs.readFileSync(path + filename);
      } catch (err) {
        if (err.code !== 'ENOENT') {
          throw err;
        }
        console.log(err);
        callback(err);
      }
      return {sld: data, filename: filename};
    });
    parseMultipleSlds(styles, callback);
}

module.exports = {
  parseMultipleFiles: parseMultipleFiles,
  parseSingleFile: parseSingleFile
};
