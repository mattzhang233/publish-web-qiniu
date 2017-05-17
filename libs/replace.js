var Promise = require('promise')
var vfs = require('vinyl-fs')
var unit = require('./unit')
var through2 = require('through2')

function main(config, replaceFiles, uploadFiles) {
  return new Promise(function (resolve, reject) {
    var relativePath;

    vfs
      .src('./web/**/*', {
        nodir: true,
        path: './'
      })
      .pipe(through2.obj(function (file, enc, cb) {
        var content = file.contents.toString().replace(config.uploadReg, function (words, pattern) {
          relativePath = unit.getRelativePath(config.path, file.path, pattern);

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
      .pipe(vfs.dest(config.path));
  });
}

module.exports = main;
