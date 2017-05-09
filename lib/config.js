var Promise = require('promise');
var path = require('path');
var fs = require('fs');


var CONFIG = {
  path: './publish-web-qiniu',
  upload: './web/**',
  qiniuAccess: 'upwff5gK6eYd52avUyB15h4J9CQV9csJHKSrqJQc',
  qiniuSecret: 'R1dHlg1lLlx1ucsl8DfHvyWjYOGiYpGMTBw1CcMa',
  bucket:'test',
  webPath: './publish-web-qiniu',
  replaceReg: ''
};

function readConfig(configPath) {
  configPath = path.resolve(configPath || CONFIG.path);

  return new Promise(function (resolve, reject) {
    fs.readFile(configPath + '/config.json', 'utf-8', function (err, data) {
      var jsonData;
      if (err) {
        reject(err.message);
      }
      else {
        try {
          jsonData = Object.assign(CONFIG,JSON.parse(data));
          jsonData.path = configPath;

          resolve(jsonData);
        }
        catch (e) {
          reject(e);
        }
      }
    });
  });
}


module.exports = readConfig;
