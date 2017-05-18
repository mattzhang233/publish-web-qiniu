var Promise = require('promise');
var fs = require('fs');

var qiniu = require('qiniu');
var unit = require('./unit');

function uploadToQiniu(config) {
  //配置
  var bucket = config.qiniuBucket;
  qiniu.conf.ACCESS_KEY = config.qiniuAccess;
  qiniu.conf.SECRET_KEY = config.qiniuSecret;

  return new Promise(function (resolve, reject) {
    unit.readUpload(config.webRoot).then(function (uploadData) {
      var len = 0;
      var domain = config.qiniuBucketDomain;
      var uploaded = uploadData.uploaded;
      var waitUpload = uploadData.waitUpload;

      for (var key in waitUpload) {
        if (waitUpload.hasOwnProperty(key)) {
          uploaded[key] = domain + waitUpload[key];
          len++;

          qiniu.io.putFile(
            (new qiniu.rs.PutPolicy(bucket + ":" + waitUpload[key])).token(),
            waitUpload[key],
            key,
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
          unit.writeUpload(config.webRoot, {
            uploaded: uploaded,
            waitUpload: {}
          }).then(resolve, reject);
        }
      }
    }, reject);
  });
}

function filterAndRecord(config, pwqfiles) {

  function needUploadFiles() {
    var file;
    var files = {};

    for (var i = pwqfiles.uploadFiles.length - 1; i >= 0; i--) {
      file = pwqfiles.uploadFiles[i];

      files[file] = pwqfiles.uploadKeys[file];
    }

    return files;
  }

  return new Promise(function (resolve, reject) {

    unit.readUpload(config.webRoot).then(function (uploadData) {
      var file, fileDomain;
      var domain = config.qiniuBucketDomain;

      for (var i = pwqfiles.uploadFiles.length - 1; i >= 0; i--) {
        file = pwqfiles.uploadFiles[i];
        fileDomain = domain + pwqfiles.uploadKeys[file];

        if (fileDomain === uploadData.uploaded[file]) {
          pwqfiles.uploadFiles.splice(i, 1);
        }
      }
      unit.writeUpload(config.webRoot, {
        waitUpload: needUploadFiles()
      }).then(resolve, reject);
    })
  });
}
module.exports = {
  'filterAndRecord': filterAndRecord,
  'uploadToQiniu': uploadToQiniu
}
