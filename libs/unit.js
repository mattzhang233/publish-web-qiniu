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
function getRelativePath(rootPath, relaticePath, nowPath) {
  return path.relative(rootPath, path.resolve(path.dirname(relaticePath), nowPath));
}
function getUploadedPath(dir) {
  return path.resolve(dir, './.publish-web-qiniu/uploaded.json');
}
function writeUploaded(dir, data) {
  var writeData = JSON.stringify(data);

  return new Promise(function (resolve, reject) {
    fs.writeFile(getUploadedPath(dir), writeData, function (err) {
      if (err) {
        reject(err.message);
      }
      else {
        resolve();
      }
    });
  });
}
function readUploaded(dir) {
  var uploaded = {};

  return new Promise(function (resolve, reject) {
    fs.readFile(getUploadedPath(dir), function (err, data) {
      var temp;
      if (!err) {
        try {
          temp = JSON.parse(data);

          if (isObject(temp)) {
            uploaded = temp;
          }
        }
        catch (e) {
        }
      }
      resolve(uploaded);
    });
  });
}


module.exports = {
  'log': log,
  'getRelativePath': getRelativePath,
  'writeUploaded': writeUploaded,
  'readUploaded': readUploaded
};
