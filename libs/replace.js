var Promise = require('promise');
var vfs = require('vinyl-fs');
var through2 = require('through2');
var unit = require('./unit')

function main(config, pwqfiles) {
  return new Promise(function (resolve, reject) {
    var path;
    var domain = config.qiniuBucketDomain;

    vfs
      .src(pwqfiles.replaceFiles, {
        nodir: true
      })
      .pipe(through2.obj(function (file, enc, cb) {
        var content = file.contents.toString().replace(config.uploadReg, function (words, pattern) {
          var path = unit.handleFilesPath(config.webRoot, file.path, pattern);

          return pwqfiles.uploadKeys[path] ? words.replace(pattern, domain + pwqfiles.uploadKeys[path]) : words;
        });

        file.contents = new Buffer(content);
        this.push(file);

        cb();
      }))
      .pipe(vfs.dest(config.webRoot))
      .on('end', resolve);
  });
}

module.exports = main;
