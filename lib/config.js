var Promise = require('promise');
var path = require('path');
var fs = require('fs');


var CONFIG = {
  path: './publish-web-qiniu',
  uploadPath: './publish-web-qiniu',
  webPath: './publish-web-qiniu',
  replaceReg: ''
};

function readConfig(configPath) {
  configPath = path.resolve(configPath || CONFIG.path);

  return new Promise(function (resolve, reject) {
    fs.readFile(configPath + '/config.json', 'utf-8', function (err, data) {
      if (err) {
        reject(err.message);
      } else {
        try {
          resolve(Object.assign(CONFIG,JSON.parse(data)))
        }
        catch (e) {
          reject(e);
        }
      }
    });
  });
}


module.exports = readConfig;
