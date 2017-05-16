var vfs = require('vinyl-fs');
var mapStream = require('map-stream');
var Promise = require('promise')
var path  = require('path');

function main(config) {
  var uploadFiles = {};
  var replaceFiles = [];

  return new Promise(function (resolve, reject) {
    vfs
      .src(config.path, {
        nodir: true
      })
      .pipe(mapStream(function (file, cb) {
        var hasUpload;
        var content = file.contents.toString();

        while (config.uploadReg.exec(content) !== null) {
          hasUpload = true;
          uploadFiles[path.resolve(path.dirname(file.path),RegExp.$1)] = path.extname(file.path);
        }
        if(hasUpload){
          replaceFiles.push(file.path);
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

