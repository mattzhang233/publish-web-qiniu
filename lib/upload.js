var glob = require("glob")
var Promise = require('promise')
var fs = require('fs')
var md5 = require('md5')
var isObject = require('is-object')
var qiniu = require('qiniu')

function getFileKeys(files) {
  var md5Files = {};
  var len = files.length;

  function handleFileKey(file, md5) {
    md5 = md5.substr(0, 7);

    file = file.replace(/\.?\//g, '-').replace(/^-/g, '');
    file = file.indexOf('.') > -1 ? file.replace('.', '-' + md5 + '.') : file + md5;

    return file;
  }

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
        md5Files[file] = handleFileKey(file, md5(buf));
        if (len <= 0) {
          resolve(md5Files);
        }
      }
    }
  });
}
function getLocalUpload(config) {

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
function writeLocalUpload(config, obj) {
  var data = JSON.stringify(obj);

  return new Promise(function (resolve, reject) {
    fs.writeFile(config.path + '/upload.json', data, function (err) {
      err ? reject(err.message) : resolve();
    });
  });
}
function uploadFiles(config, files) {
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
      }
    }
    function uploadfinishHandle(err, ret) {
      len--;

      if (err) {
        reject(err.error);
      }

      if (len <= 0) {
        resolve();
      }
    }
  });
}

function upload(resolve, reject, config, files) {
  var localData, fileKeys;
  var needUploadFiles = {};


  function handleErr(message) {
    reject(message);
  }

  Promise.all([getLocalUpload(config), getFileKeys(files)]).then(function (data) {
    localData = data[0];
    fileKeys = data[1];

    for (var key in fileKeys) {
      if (fileKeys.hasOwnProperty(key) && fileKeys[key] !== localData[key]) {
        needUploadFiles[key] = localData[key] = fileKeys[key];

      }
    }
    return uploadFiles(config, needUploadFiles);
  }, handleErr).then(function () {
    return writeLocalUpload(config, localData);
  }, handleErr).then(function () {
    resolve(config,needUploadFiles);
  },handleErr);
}
function main(config) {
  return new Promise(function (resolve, reject) {
    glob(config.upload, {
      nodir: true
    }, function (er, files) {
      er ? reject(er) : upload(resolve, reject, config, files);
    });
  });
}

module.exports = main;
