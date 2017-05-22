var DEFAULT_CONFIG = {
  webRoot: null,
  webGlobs: null,
  uploadedDelete:false,
  systemDir:'./.publish-web-qiniu',
  uploadReg: /(?:href=|src=|url\()['|"]([^\s>"']+?)['|"]/gi,

  qiniuAccess: null,
  qiniuSecret: null,
  qiniuBucket: null,
  qiniuBucketDomain: null,

  onCollectPath:null,
  onFinish:null
};
var fs = require('fs');
var path = require('path');
var Promise = require('promise');

function main(config) {
  config = Object.assign(DEFAULT_CONFIG, config);

  return new Promise(function (resolve, reject) {
    var domain;
    for (var key in DEFAULT_CONFIG) {
      if (DEFAULT_CONFIG.hasOwnProperty(key) && (key.indexOf('on') === -1 && key!== 'uploadedDelete')) {
        if (!config[key]) {
          reject('config.' + key + ' is a required');
          return;
        }
      }
    }

    domain = config.qiniuBucketDomain;
    if(domain.indexOf('//') === -1){
      reject('config.qiniuBucketDomain must have protocol');
    }
    else{
      config.qiniuBucketDomain = domain.lastIndexOf('/') === domain.length - 1 ? domain : domain + '/';
      config.webRoot = path.resolve(config.webRoot);
      config.systemDir = path.resolve(config.webRoot,config.systemDir);

      fs.mkdir(config.systemDir,function (err) {

      });

      resolve(config);
    }
  });
}

module.exports = main;
