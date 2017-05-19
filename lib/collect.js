var vfs = require('vinyl-fs');
var mapStream = require('map-stream');
var Promise = require('promise');
var unit = require('./unit');

function main(config) {
  var files = {};

  return new Promise(function (resolve) {
    var path;
    var content;

    vfs
      .src(config.webGlobs, {
        nodir: true
      })
      .pipe(mapStream(function (file, cb) {
        content = file.contents.toString();
        files[file.path] = [];

        while (config.uploadReg.exec(content) !== null) {
          path = unit.handleFilePath(config.webRoot, file.path, RegExp.$1);
          if (path.length) {
            files[file.path].push(path);
          }
        }

        cb();
      }))
      .on('end', function () {
        resolve(files);
      })
  });
}
module.exports = main;

