var Promise = require('promise')

function writeLocalUpload(config, obj) {
  var data = JSON.stringify(obj);

  return new Promise(function (resolve, reject) {
    fs.writeFile(config.path + '/upload.json', data, function (err) {
      err ? reject(err.message) : resolve();
    });
  });
}
function replace(resolve, reject, config, uploadFiles,webFiles) {

}
function main(config,uploadFiles) {
  return new Promise(function (resolve, reject) {
    glob(config.upload, {
      nodir: true
    }, function (er, webFiles) {
      er ? reject(er) : replace(resolve, reject, config, uploadFiles,webFiles);
    });
  });
}

module.exports = main;
