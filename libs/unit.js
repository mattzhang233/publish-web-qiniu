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

function writeUploaded() {

}
function readUploaded(dir) {
  var uploadPath = path.resolve(dir, './.publish-web-qiniu/uploaded.json');
  var Uploaded = {};

  return new Promise(function (resolve, reject) {
    fs.readFile(uploadPath, function (err, buf) {
      var temp;
      if (!err) {
        try {
          temp = JSON.parse(buf);

          if (isObject(temp)) {
            Uploaded = temp;
          }
        }
        catch (e) {
        }
      }

      resolve(Uploaded);
    });
  });
}


module.exports = {
  'log': log,
  'getRelativePath': getRelativePath,
  'writeUploaded': writeUploaded,
  'readUploaded': readUploaded
};
