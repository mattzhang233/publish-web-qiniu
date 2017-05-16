var glob = require("glob")
var Promise = require('promise')
var fs = require('fs')
var md5 = require('md5')
var qiniu = require('qiniu')

function getFileKeys(files) {
  var fileKeys = {};

  return new Promise(function (resolve, reject) {
    var len = 0;
    for (var key in files) {
      if (files.hasOwnProperty(key)) {
        len++;

        fs.readFile(key, (function (file) {
          return function (err, buf) {
            if (err) {
              reject(err.message);
            }
            else {
              len--;
              fileKeys[file] = md5(buf) + fileKeys[file];
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
          key,
          new qiniu.io.PutExtra(),
          uploadfinishHandle
        );

        files[key] = config.qiniuBucketDomain + '/' + files[key];
      }
    }
    function uploadfinishHandle(err, ret) {
      len--;

      if (err) {
        reject(err.error);
      }

      if (len <= 0) {
        resolve(files);
      }
    }
  });
}
function main(config, data) {
  var uploadFiles = data.uploadFiles;

  return new Promise(function (resolve, reject) {
    function handleErr(message) {
      reject('upload——>' + message);
    }

    getFileKeys(uploadFiles)
      .then(function (data) {
        return upload(config, data);
      }, handleErr)
      .then(function (data) {
        console.log(data)
        resolve(data);
      }, handleErr);
  });
}

module.exports = main;
