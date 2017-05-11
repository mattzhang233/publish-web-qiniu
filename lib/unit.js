var colors = require('colors')
var moment = require('moment')

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
module.exports = {
  'log': log
};