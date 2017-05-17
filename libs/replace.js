var Promise = require('promise');
var vfs = require('vinyl-fs');
var through2 = require('through2');

var unit = require('./unit');

function main(config, replaceFiles, uploadFiles) {
  return new Promise(function (resolve, reject) {
    var relativePath;

    vfs
      .src(replaceFiles, {
        nodir: true
      })
      .pipe(through2.obj(function (file, enc, cb) {
        var content = file.contents.toString().replace(config.uploadReg, function (words, pattern) {
          relativePath = unit.getRelativePath(config.webRoot, file.path, pattern);

          if (uploadFiles[relativePath]) {
            return words.replace(pattern, uploadFiles[relativePath]);
          }
          else {
            return words;
          }
        });

        file.contents = new Buffer(content);
        this.push(file);

        cb();
      }))
      .pipe(vfs.dest(config.webRoot))
      .on('end', function () {
        unit.writeUploaded(config.webRoot, uploadFiles).then(resolve, reject);
      });
  });
}

module.exports = main;
