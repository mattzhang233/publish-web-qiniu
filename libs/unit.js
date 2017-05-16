var colors = require('colors')
var moment = require('moment')
var isObject = require('is-object');
var isArray = require('is-array');
var isString = require('is-string');


colors.setTheme({
  silly: 'rainbow',
  input: 'grey',
  verbose: 'cyan',
  prompt: 'red',
  info: 'green',
  data: 'blue',
  help: 'cyan',
  warn: 'yellow',
  debug: 'magenta',
  error: 'red'
});

function log(message, type) {
  message = message.toString();
  type = type || 'info';

  console.log('[' + getTime() + '] ' + message[type]);


  function getTime() {
    return moment().format('HH:mm:ss')
  }
}

function handleSrc(src) {
  var srcs = [];

  if (isObject(src)) {
    for (var key in src) {
      if (src.hasOwnProperty(key)) {
        srcs = srcs.concat(handleSrc(src[key]));
      }
    }
  }
  else if (isArray(src)) {
    srcs = src;
  }
  else if (isString(src)) {
    srcs = [src];
  }
  else {
    log('config.uploadSrc 不是一个合法的参数', 'error');
    process.exit(0);
  }

  return srcs;
}
module.exports = {
  'log': log,
  'handleSrc':handleSrc
};
