var glob = require("glob")
var Promise = require('promise')
var fs = require('fs')
var md5 = require('md5')
var isObject = require('is-object')
var qiniu = require('qiniu')

function parse(resolve, reject, config, files) {
  var waitUploadFiles = {};

  Promise.all([getLocalUploadData(config), getMd5Files(files)]).then(function (data) {
    var uploadData = data[0];
    var md5Files = data[1];

    for (var key in md5Files) {
      if (md5Files.hasOwnProperty(key)) {
        if (md5Files[key] !== uploadData[key]) {
          waitUploadFiles[key] = md5Files[key];
        }
      }
    }

    return uploadFiles(config,waitUploadFiles);
  }, function (err) {
    reject(err);
  });
}
function getMd5Files(files) {
  var md5Files = {};
  var len = files.length;

  return new Promise(function (resolve, reject) {
    for (var i = 0; i < len; i++) {
      fs.readFile(files[i], (function (file) {
        return function (err, buf) {
          handleCallback(file, err, buf);
        }
      }(files[i])));
    }

    function handleCallback(file, err, buf) {

      if (err) {
        reject(err.message);
      }
      else {
        len--;
        md5Files[file] = md5(buf);
        if (len <= 0) {
          resolve(md5Files);
        }
      }
    }
  });
}
function getLocalUploadData(config) {

  return new Promise(function (resolve, reject) {
    var errMessage, uploadData;

    fs.readFile(config.path + '/upload.json', 'utf8', function (err, data) {

      if (err) {
        uploadData = {};
      }
      else {
        try {
          uploadData = JSON.parse(data);

          if (!isObject(uploadData)) {
            uploadData = {};
          }
        }
        catch (e) {
          errMessage = e;
        }
      }
      errMessage ? reject(errMessage) : resolve(uploadData);
    });
  });
}
function uploadFiles(config,files) {
  //配置
  var bucket = config.bucket;
  qiniu.conf.ACCESS_KEY = config.qiniuAccess;
  qiniu.conf.SECRET_KEY = config.qiniuSecret;

  return new Promise(function (resolve, reject) {

    function uploadFile(key, localFile) {
      var extra = new qiniu.io.PutExtra();
      var uptoken = (new qiniu.rs.PutPolicy(bucket+":"+key)).token();
      qiniu.io.putFile(uptoken, key, localFile, extra, function(err, ret) {
        if(!err) {
          // 上传成功， 处理返回值
          console.log(ret.hash, ret.key, ret.persistentId);
        } else {
          // 上传失败， 处理返回代码
          console.log(err);
        }
      });
    }
  });
}
function main(config) {
  return new Promise(function (resolve, reject) {
    glob(config.upload, {
      nodir: true
    }, function (er, files) {
      er ? reject(er) : parse(resolve, reject, config, files);
    });
  });
}

module.exports = main;
