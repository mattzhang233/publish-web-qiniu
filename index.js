var qiniu = require('qiniu');
var argv = require('yargs').argv;

var config = require('./lib/config')();
var log = require('./lib/log')

//读取设置
config.then(function (data) {
  console.error(data)
},function (err) {
  log(err,'error');
});
