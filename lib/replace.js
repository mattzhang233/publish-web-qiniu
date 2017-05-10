var Promise = require('promise')

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
