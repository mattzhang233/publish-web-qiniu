var unit = require('./lib/unit');
var conf = require('./lib/config');
var collect = require('./lib/collect');
var upload = require('./lib/upload');
var replace = require('./lib/replace');
var Pwqfiles = require('./lib/pwqfiles');
var ora = require('ora');

var spinner;


function plugin(config) {
  var pwqfiles;

  spinner = ora('init configing').start();

  conf(config).then(function (data) {
    config = data;

    spinner.stop();
    unit.log('init config finish', 'info');
    spinner = ora('collecting need to upload the file').start();

    return collect(config);
  }).then(function (files) {
    pwqfiles = new Pwqfiles(files);

    return pwqfiles.init(config);
  }).then(function () {
    return new Promise(function (resolve, reject) {
      var cbData;

      if (config.onCollected) {
        cbData = config.onCollected(pwqfiles);

        if (cbData && cbData.then) {
          cbData.then(function (argPwqfiles) {
            pwqfiles = argPwqfiles;

            upload.filterAndRecord(config, pwqfiles).then(resolve, reject);
          }, reject);
          return;
        }
        pwqfiles = cbData;
      }
      upload.filterAndRecord(config, pwqfiles).then(resolve, reject);
    });
  }).then(function () {
    spinner.stop();
    unit.log('collect finish');
    spinner = ora('replacing the file path').start();

    return replace(config, pwqfiles);
  }).then(function (data) {
    spinner.stop();
    unit.log('replace finish');
    spinner = ora('uploading files').start();

    return upload.uploadToQiniu(config, spinner)
  }).then(function (total) {
    var cbData;
    if (config.onFinish) {
      cbData = config.onFinish();

      if (cbData && cbData.then) {
        cbData.then(function () {
          handleFinish(total);
        }, handleError);
        return;
      }
    }
    handleFinish(total);
  }, handleError);

  function handleFinish(total) {
    spinner.stop();
    unit.log('upload finish');
    unit.log('replaced ' + pwqfiles.replaceFiles.length + ' files,uploaded ' + total + ' files', 'warn');
    unit.log('publish finish');
  }

  function handleError(errorMessage) {
    if (spinner && spinner.stop) {
      spinner.stop();
    }

    unit.log(errorMessage, 'error');
  }
}
module.exports = plugin;
