var vfs = require('vinyl-fs');
var mapStream = require('map-stream');
var Promise = require('promise')

function main(config) {
  var uploadFiles = {};
  var replaceFiles = [];

  return new Promise(function (resolve, reject) {
    vfs
      .src(config.path, {
        nodir: true
      })
      .pipe(mapStream(function (file, cb) {
        var result;
        var lastIndex = replaceFiles.length - 1;
        var content = file.contents.toString();

        while (config.uploadReg.exec(content) !== null) {
          result = RegExp.$1;

          if (replaceFiles[lastIndex] !== result) {
            replaceFiles.push(file.path);
          }
          uploadFiles[result] = true;
        }

        cb();
      }))
      .on('end', function () {
        resolve({
          'uploadFiles':uploadFiles,
          'replaceFiles':replaceFiles
        });
      })
  });
}
module.exports = main;

