var colors = require('colors')
var moment = require('moment')
var path = require('path')


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

function handlePath(webPath) {
  return path.resolve(webPath.toString());
}
function getRelativePath(webPath, relaticePath, nowPath) {
  return path.relative(webPath, path.resolve(path.dirname(relaticePath), nowPath));
}

module.exports = {
  'log': log,
  'handlePath': handlePath,
  'getRelativePath': getRelativePath
};
