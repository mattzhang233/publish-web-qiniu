var unit = require('./libs/unit');
var defaultConfig = require('./libs/config');
var collect = require('./libs/collect')
var upload = require('./libs/upload')
var replace = require('./libs/replace')


function plugin(config) {
  //处理配置
  config = Object.assign(defaultConfig, config);
  config.path = unit.handleWebDirectory(config.path);

  collect(config).then(function (data) {
    return upload(config,data)
  }).then(function (data) {
    return replace(data);
  },function (message) {
    unit.log(message,'error');
  }).then(function () {
    console.log(123123)
  });
}
plugin();
module.exports = plugin;
