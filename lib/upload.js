var Promise = require('promise');
var fs = require('fs');
var path = require('path');
var qiniu = require('qiniu');
var unit = require('./unit');

function uploadToQiniu(config, spinner) {
  //配置
  var MAX_UPLOAD = 5;
  var bucket = config.qiniuBucket;

  qiniu.conf.ACCESS_KEY = config.qiniuAccess;
  qiniu.conf.SECRET_KEY = config.qiniuSecret;

  return new Promise(function (resolve, reject) {
    unit.readUpload(config.systemDir).then(function (uploadData) {
      var totalUpload = 0;
      var uploadingNum = 0;
      var uploadQueue = [];
      var hasFinish = false;
      var uploaded = uploadData.uploaded;
      var waitUpload = uploadData.waitUpload;

      for (var key in waitUpload) {
        if (waitUpload.hasOwnProperty(key) && !uploaded[key]) {
          uploaded[key] = waitUpload[key]['domain'];
          uploadQueue.push(Object.assign({
            'file': path.resolve(config.webRoot, key)
          }, waitUpload[key]));
        }
      }
      totalUpload = uploadQueue.length;
      uploadNext();

      function uploadNext() {
        var len = uploadQueue.length;
        if (len) {
          for (var i = Math.min(len, MAX_UPLOAD - uploadingNum); i > 0; i--) {
            uploadingNum++;
            spinner.text = 'uploading files ' + (totalUpload - uploadQueue.length + 1) + '/' + totalUpload;
            uploadFile(uploadQueue[0]);
            uploadQueue.splice(0, 1);
          }
        }
        else {
          //上传完成
          if (!hasFinish) {
            hasFinish = true;

            unit.writeUpload(config.systemDir, {
              uploaded: uploaded,
              waitUpload: {}
            }).then(function () {
              resolve(totalUpload);
            }, reject);
          }
        }
      }

      function uploadFile(uploadInfo) {
        qiniu.io.putFile(
          (new qiniu.rs.PutPolicy(bucket + ":" + uploadInfo.key)).token(),
          uploadInfo.key,
          uploadInfo.file,
          new qiniu.io.PutExtra(),
          (function (file) {
            return function (err, ret) {
              if (err) {
                reject(err);
              }
              else {
                uploadingNum--;
                uploadNext();

                if(config.uploadedDelete){
                  fs.unlink(file, function(err) {
                    if (err) {
                    }
                  });
                }
              }
            }
          }(uploadInfo.file))
        );
      }
    }, reject).catch(function (err) {
      reject(err.message || err);
    });
  });
}

function filterAndRecord(config, pwqfiles) {

  return new Promise(function (resolve, reject) {

    unit.readUpload(config.systemDir).then(function (uploadData) {
      var file;

      for (var key in pwqfiles.uploadFiles) {
        if (pwqfiles.uploadFiles.hasOwnProperty(key)) {
          file = pwqfiles.uploadFiles[key];

          if (file.domain === uploadData.uploaded[file]) {
            delete pwqfiles.uploadFiles[key];
          }
        }
      }
      unit.writeUpload(config.systemDir, {
        waitUpload: pwqfiles.uploadFiles
      }).then(resolve, reject);
    })
  });
}
module.exports = {
  'filterAndRecord': filterAndRecord,
  'uploadToQiniu': uploadToQiniu
};
