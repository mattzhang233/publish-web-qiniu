var unit = require('./libs/unit');
var conf = require('./libs/config');
var collect = require('./libs/collect')
var upload = require('./libs/upload')
var replace = require('./libs/replace')

function handleError(data) {
  var errorModule = data[0];
  var errorMessage = data[1];

  unit.log(errorModule +' : '+ errorMessage, 'error');
}
function plugin(config) {
  var uploadFiles, replaceFiles;

  conf(config).then(collect).then(function (data) {
    replaceFiles = data.replaceFiles;
    uploadFiles = data.uploadFiles;

    return upload(config, uploadFiles)
  }).then(function (data) {
    uploadFiles = data;

    return replace(config, replaceFiles, uploadFiles);
  }).then(function () {
    console.log(123123)
  }, handleError);
}
plugin();
module.exports = plugin;
