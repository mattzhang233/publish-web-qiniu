var Promise = require('promise');
var unit = require('./unit');
var vfs = require('vinyl-fs');
var mapStream = require('map-stream');
var trim = require('trim');
var path = require('path');
var md5 = require('md5');

function Pwqfiles(files) {
  this._init = false;

  this.files = files;

  this.replaceFiles = [];
  this.uploadFiles = {};
  this.uploadMaps = {};
}
Pwqfiles.prototype = {
  constructor: Pwqfiles,
  init: function (config) {
    var that = this;

    function getRelative(filePath) {
      return path.relative(config.webRoot, filePath)
    }

    function getKeys(files) {
      function getKey(filePath, md5) {
        var key = filePath.replace(/\\/g, '-');
        var dotIndex = key.lastIndexOf('.');

        md5 = md5.substr(0, 8);
        return dotIndex > -1 ?
          key.substring(0, dotIndex) + '-' + md5 + key.substring(dotIndex) :
          key + '-' + md5;
      }

      return new Promise(function (resolve, reject) {
        if(files.length){
          vfs
            .src(files, {
              nodir: true,
              cwd: config.webRoot
            })
            .on('error', function (err) {
              var file;
              var errorMessage = err.message;

              if (errorMessage.indexOf('not found')) {
                file = trim(errorMessage.substring(errorMessage.indexOf(':') + 1));

                errorMessage = 'not found file ' + file + ' in ' + that.uploadMaps[getRelative(file)];
              }

              reject(errorMessage);
            })
            .pipe(mapStream(function (file, cb) {
              var relativePath = getRelative(file.path);

              that.uploadFiles[relativePath]['key'] = getKey(relativePath, md5(file.contents));
              that.uploadFiles[relativePath]['domain'] += that.uploadFiles[relativePath]['key'];
              cb();
            }))
            .on('end', resolve);
        }
        else{
          resolve();
        }
      });
    }

    return new Promise(function (resolve, reject) {
      var hasUpload, files, file;
      var uploadFiles = [];

      if (that._init) {
        resolve();
      }
      else {
        //处理files
        for (var key in that.files) {

          if (that.files.hasOwnProperty(key)) {
            files = that.files[key];
            hasUpload = false;

            for (var len = files.length - 1; len >= 0; len--) {
              file = files[len];

              if (!that.uploadFiles[file]) {
                hasUpload = true;

                that.uploadMaps[file] = key;
                that.uploadFiles[file] = {domain: config.qiniuBucketDomain};
                uploadFiles.push(file);
              }
            }
            !hasUpload || that.replaceFiles.push(path.relative(config.webRoot, key));
          }
        }
        //get keys
        getKeys(uploadFiles).then(function () {
          this._init = true;
          resolve();
        }, reject);
      }
    });
  }
};

module.exports = Pwqfiles;
