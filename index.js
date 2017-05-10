var argv = require('yargs').argv;

var config = require('./lib/config')
var log = require('./lib/log')
var upload = require('./lib/upload')
var replace = require('./lib/replace')

config()
  .then(function (data) {
    return upload(data);
  }, handleError)
  .then(function (config,files) {
    return replace(config,files);
  }, handleError).then(function () {
  console.log('finish')
},handleError);


function handleError(message) {
  log(message, 'error');
}
