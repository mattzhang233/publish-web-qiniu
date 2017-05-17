var DEFAULT_CONFIG = {
  webRoot: './web',
  webGlobs: ['./web/**/*'],
  uploadReg: /(?:href=|src=|url\()['|"]([^\s>"']+?)['|"]/gi,

  qiniuAccess: 'upwff5gK6eYd52avUyB15h4J9CQV9csJHKSrqJQc',
  qiniuSecret: 'R1dHlg1lLlx1ucsl8DfHvyWjYOGiYpGMTBw1CcMa',
  qiniuBucket: 'test',
  qiniuBucketDomain: 'http://opojd4psd.bkt.clouddn.com'
};

var Promise = require('promise');

function main(config) {
  config = Object.assign(DEFAULT_CONFIG, config);

  return new Promise(function (resolve, reject) {
    for (var key in DEFAULT_CONFIG) {
      if (DEFAULT_CONFIG.hasOwnProperty(key)) {
        if (!config[key]) {
          reject([
            'CONFIG ERROR',
            'config.' + key + ' is a required'
          ]);
          return;
        }
      }
    }

    resolve(config);
  });
}

module.exports = main;
