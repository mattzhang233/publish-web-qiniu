var unit = require('./libs/unit');
var conf = require('./libs/config');
var collect = require('./libs/collect')
var upload = require('./libs/upload')
var replace = require('./libs/replace')
var Pwqfiles = require('./libs/pwqfiles')

function handleError(errorMessage) {

  unit.log(errorMessage, 'error');
}
function plugin(config) {
  var pwqfiles;

  conf(config).then(function (data) {
    config = data;

    return collect(config);
  }).then(function (files) {
    pwqfiles = new Pwqfiles(files);

    return pwqfiles.init(config);
  }).then(function () {
    return upload.filterAndRecord(config, pwqfiles);
  }).then(function () {
    return replace(config, pwqfiles);
  }).then(function (data) {
    return upload.uploadToQiniu(config)
  }).then(function () {
    console.log('完成');
  }, handleError);
}
module.exports = plugin;
