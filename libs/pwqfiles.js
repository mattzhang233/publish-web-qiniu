var Promise = require('promise');
var unit = require('./unit')
var vfs = require('vinyl-fs');
var mapStream = require('map-stream');
var trim = require('trim');
var path = require('path')
var md5 = require('md5');

function Pwqfiles(files) {
  this._init;

  this.files = files;

  this.replaceFiles = [];
  this.uploadFiles = [];
  this.uploadMaps = {};
  this.uploadKeys = {};
}
Pwqfiles.prototype = {
  constructor: Pwqfiles,
  init: function (config) {
    var that = this;

    function getKeys() {
      function getKey(filePath, md5) {
        var key = path.relative(config.webRoot, filePath).replace('\\', '-');
        var dotIndex = key.lastIndexOf('.');

        md5 = md5.substr(0, 8);
        return dotIndex > -1 ?
          key.substring(0, dotIndex) + '-' + md5 + key.substring(dotIndex) :
          key + '-' + md5;
      }

      return new Promise(function (resolve, reject) {

        vfs
          .src(that.uploadFiles, {
            nodir: true,
            cwd: config.webRoot
          })
          .on('error', function (err) {
            var file;
            var errorMessage = err.message;

            if (errorMessage.indexOf('not found')) {
              file = trim(errorMessage.substring(errorMessage.indexOf(':') + 1));

              errorMessage = 'not found file ' + file + ' in ' + that.uploadMaps[file];
            }

            reject(errorMessage);
          })
          .pipe(mapStream(function (file, cb) {
            that.uploadKeys[file.path] = getKey(file.path, md5(file.contents));
            cb();
          }))
          .on('end', function () {
            resolve();
          })
      });
    }

    return new Promise(function (resolve, reject) {
      var hasUpload, files, files;

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
              file = unit.handleFilesPath(config.webRoot, key, files[len]);

              if (file.length) {
                hasUpload = true;

                if (!that.uploadMaps[file]) {
                  that.uploadMaps[file] = key;
                  that.uploadFiles.push(file);
                }
              }
            }
            if (hasUpload) {
              that.replaceFiles.push(key);
            }
          }
        }
        //get keys
        getKeys().then(function () {
          this._init = true;
          resolve();
        }, reject);
      }
    });
  }
}

module.exports = Pwqfiles;
