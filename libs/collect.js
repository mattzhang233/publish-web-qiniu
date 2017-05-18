var vfs = require('vinyl-fs');
var mapStream = require('map-stream');
var Promise = require('promise');


function arrayRemoveRepeat(arr) {
  arr.sort();

  for (var i = arr.length - 2; i >= 0; i--) {
    if (arr[i + 1] === arr[i]) {
      arr.splice(i, 1);
    }
  }

  return arr;
}

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
            files[file.path].push(RegExp.$1);
        }

        cb();
      }))
      .on('end', function () {
        resolve(files);
      })
  });
}
module.exports = main;

