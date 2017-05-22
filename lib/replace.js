var Promise = require('promise');
var vfs = require('vinyl-fs');
var through2 = require('through2');
var unit = require('./unit');
var path = require('path');

function main(config, pwqfiles) {
  return new Promise(function (resolve, reject) {
    var filePath;
    var content;
    if(pwqfiles.replaceFiles.length){
      vfs
        .src(pwqfiles.replaceFiles, {
          nodir: true,
          cwd: config.webRoot
        })
        .pipe(through2.obj(function (file, enc, cb) {
           content = file.contents.toString().replace(config.uploadReg, function (words, pattern) {
            filePath = unit.handleFilePath(config.webRoot, file.path, pattern);

            return filePath.length && pwqfiles.uploadFiles[filePath] ? words.replace(pattern, pwqfiles.uploadFiles[filePath]['domain']) : words;
          });

          file.contents = new Buffer(content);
          this.push(file);

          cb();
        }))
        .pipe(vfs.dest(function (file) {
          return path.resolve(file.path,'../');
        }))
        .on('end', resolve);
    }
    else{
      resolve();
    }
  });
}

module.exports = main;
