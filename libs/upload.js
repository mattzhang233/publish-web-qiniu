var Promise = require('promise');
var fs = require('fs');
var md5 = require('md5');
var qiniu = require('qiniu');
var path = require('path');

var unit = require('./unit');

function getFileKeys(config, files) {
  var fileKeys = {};

  function getKey(file, md5) {
    var key = file.replace('\\', '-');

    md5 = md5.substr(0, 8);
    return key.indexOf('.') > -1 ? key.replace('.', '-' + md5 + '.') : key + '-' + md5;
  }

  return new Promise(function (resolve, reject) {
    var len = files.length;

    for (var i = len - 1; i >= 0; i--) {
      fs.readFile(path.resolve(config.webRoot, files[i]), (function (file) {
        return function (err, data) {
          if (err) {
            reject(err.message);
          }
          else {
            fileKeys[file] = getKey(file, md5(data));
            !(--len <= 0) || resolve(fileKeys);
          }
        }
      }(files[i])));
    }
  });
}
function upload(config, files) {
  //配置
  var bucket = config.qiniuBucket;
  qiniu.conf.ACCESS_KEY = config.qiniuAccess;
  qiniu.conf.SECRET_KEY = config.qiniuSecret;


  return new Promise(function (resolve, reject) {
    var len = 0;
    for (var key in files) {
      if (files.hasOwnProperty(key)) {
        len++;
        qiniu.io.putFile(
          (new qiniu.rs.PutPolicy(bucket + ":" + files[key])).token(),
          files[key],
          path.resolve(config.path, key),
          new qiniu.io.PutExtra(),
          uploadfinishHandle
        );
      }
    }
    function uploadfinishHandle(err, ret) {
      len--;

      if (err) {
        reject(err.error);
      }
      else if (len <= 0) {
        resolve();
      }
    }
  });
}
function main(config, uploadFiles) {
  var uploadedKeys;

  return new Promise(function (resolve, reject) {
    Promise.all([unit.readUploaded(config.webRoot), getFileKeys(config, uploadFiles)])
      .then(function (data) {
        var needUpload = {};
        var uploadKeys = data[1];

        uploadedKeys = data[0];

        for (var key in uploadKeys) {
          if (uploadKeys.hasOwnProperty(key) && uploadKeys[key] !== uploadedKeys[key]) {
            uploadedKeys[key] = needUpload[key] = uploadKeys[key];
          }
        }

        return upload(config, needUpload);
      })
      .then(function () {
        resolve(uploadedKeys);
      }, function (errorMessage) {
        reject(errorMessage);
      });
  });
}

module.exports = main;
