
var argv = require('yargs').argv;

var config = require('./lib/config')();
var log = require('./lib/log')
var upload = require('./lib/upload')

//读取设置
config
  .then(function (data) {
    return upload(data);
  }, handleError)
  .then(function () {

  }, handleError);


function handleError(message) {
  log(message, 'error');
}
