var vfs = require('vinyl-fs');
var mapStream = require('map-stream');
var Promise = require('promise');
var unit = require('./unit');


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
  var uploadFiles = [];
  var replaceFiles = [];

  return new Promise(function (resolve) {
    var path;
    var hasUpload;
    var content;

    vfs
      .src(config.webGlobs, {
        nodir: true
      })
      .pipe(mapStream(function (file, cb) {
        hasUpload = false;
        content = file.contents.toString();

        while (config.uploadReg.exec(content) !== null) {
          path = RegExp.$1;

          if (path.indexOf(config.qiniuBucketDomain) === -1) {
            hasUpload = true;
            uploadFiles.push(unit.getRelativePath(config.webRoot, file.path, path));
          }
        }
        if (hasUpload) {
          replaceFiles.push(file.path);
        }

        cb();
      }))
      .on('end', function () {
        resolve({
          'uploadFiles': arrayRemoveRepeat(uploadFiles),
          'replaceFiles': replaceFiles
        });
      })
  });
}
module.exports = main;

