var colors = require('colors');
var moment = require('moment');
var path = require('path');
var Promise = require('promise');
var fs = require('fs');
var isObject = require('is-object');


colors.setTheme({
  silly: 'rainbow',
  input: 'grey',
  verbose: 'cyan',
  prompt: 'red',
  info: 'green',
  data: 'blue',
  help: 'cyan',
  warn: 'yellow',
  debug: 'magenta',
  error: 'red'
});

function log(message, type) {
  message = message.toString();
  type = type || 'info';

  console.log('[' + getTime() + '] ' + message[type]);


  function getTime() {
    return moment().format('HH:mm:ss')
  }
}
function handleFilesPath(rootPath, relaticePath, nowPath) {
  var firstString = nowPath.substr(0, 1);

  if (firstString === '#' || nowPath.indexOf('//') > -1 || nowPath.indexOf(':') > -1) {
    return '';
  }
  if (firstString !== '.' && firstString !== '/') {
    nowPath = './' + nowPath;
  }
  if (nowPath.indexOf('?') !== -1) {
    nowPath = nowPath.substr(0, nowPath.indexOf('?'))
  }
  return firstString === '/' ?
    path.resolve(rootPath, '.' + nowPath) :
    path.resolve(path.dirname(relaticePath), nowPath);
}

function getUploadDir(dir) {
  dir = path.resolve(dir, './.publish-web-qiniu');

  fs.mkdir(dir, function (err) {

  });

  return dir;
}
function writeUpload(dir, data) {
  return new Promise(function (resolve, reject) {
    readUpload(dir).then(function (uploadData) {
      fs.writeFile(path.resolve(getUploadDir(dir), './upload.json'), JSON.stringify(Object.assign(uploadData, data)), function (err) {
        err ? reject(err.message) : resolve();
      });
    }, reject);
  });
}
function readUpload(dir) {
  var readData = {
    uploaded: {},
    waitUpload: {}
  }

  return new Promise(function (resolve, reject) {
    fs.readFile(path.resolve(getUploadDir(dir), './upload.json'), function (err, data) {
      var temp;
      if (!err) {
        try {
          temp = JSON.parse(data);

          if (isObject(temp)) {
            Object.assign(readData, temp);
          }
        }
        catch (e) {
        }
      }
      resolve(readData);
    });
  });
}


module.exports = {
  'log': log,
  'handleFilesPath': handleFilesPath,
  'writeUpload': writeUpload,
  'readUpload': readUpload
};
