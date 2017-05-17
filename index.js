var unit = require('./libs/unit');
var conf = require('./libs/config');
var collect = require('./libs/collect')
var upload = require('./libs/upload')
var replace = require('./libs/replace')

function handleError(errorMessage) {

  unit.log(errorMessage, 'error');
}
function plugin(config) {
  var replaceFiles;

  conf(config).then(function (data) {
    config = data;

    return collect(config);
  }).then(function (data) {
    replaceFiles = data.replaceFiles;

    return upload(config, data.uploadFiles)
  }).then(function (data) {
    return replace(config, replaceFiles, data);
  }).then(function () {
    console.log('完成')
  }, handleError);
}
plugin();
module.exports = plugin;
