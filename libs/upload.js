var Promise = require('promise')
var fs = require('fs')
var md5 = require('md5')
var qiniu = require('qiniu')
var path = require('path')

var unit = require('./unit')

function getFileKeys(config, files) {
  var fileKeys = {};

  function getKey(file, md5) {
    var key = file.replace('\\', '-');

    md5 = md5.substr(0, 8);
    return key.indexOf('.') > -1 ? key.replace('.', '-' + md5 + '.') : key + '-' + md5;
  }

  return new Promise(function (resolve, reject) {
    var len = 0;
    for (var key in files) {
      if (files.hasOwnProperty(key)) {
        len++;

        fs.readFile(path.resolve(config.path, key), (function (file) {
          return function (err, buf) {
            if (err) {
              reject(err.message);
            }
            else {
              len--;
              fileKeys[file] = getKey(file, md5(buf));
              if (len <= 0) {
                resolve(fileKeys);
              }
            }
          }
        }(key)));
      }
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
  var uploadedFiles;


  return new Promise(function (resolve, reject) {
    function handleErr(message) {
      reject('upload——>' + message);
    }

    Promise.all([unit.readUploaded(config.path), getFileKeys(config, uploadFiles)])
      .then(function (data) {
        var needUploadFiles = {};
        uploadedFiles = data[0];
        uploadFiles = data[1];

        for (var key in uploadFiles) {
          if (uploadFiles.hasOwnProperty(key) && uploadFiles[key] !== uploadedFiles[key]) {
            uploadedFiles[key] = needUploadFiles[key] = uploadFiles[key];
          }
        }

        return upload(config, needUploadFiles);
      }, handleErr)
      .then(function () {
        resolve(uploadedFiles);
      }, handleErr);
  });
}

module.exports = main;
