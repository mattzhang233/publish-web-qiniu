var isObject = require('is-object');
var isArray = require('is-array');
var isString = require('is-string');
var vfs = require('vinyl-fs');
var mapStream = require('map-stream');

var unit = require('./lib/unit');
var defaultConfig = require('./lib/config');

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
    unit.log('config.uploadSrc 不是一个合法的参数', 'error');
    process.exit(0);
  }

  return srcs;
}

function plugin(config) {
  var config = Object.assign(defaultConfig, config);
  var srcs = handleSrc(config.uploadSrc);

  vfs.src(srcs, {
      nodir: true
    })
    .pipe(mapStream(function (file, cb) {
      var content = file.contents.toString().replace(options.reg, function (words, pattern) {
        path = options.handlePath ? options.handlePath(pattern) : pattern;
        try {
          if (!cache[path]) {
            md5Value = md5(fs.readFileSync(path).toString());

            cache[path] = options.handleRev ? options.handleRev(path, md5Value) : path + '?rev=' + md5Value;
          }

          pattern = cache[path];
        }
        catch (e) {
          gutil.log("Can't solve the version control-" + path);
        }
        return pattern;
      });

      file.contents = new Buffer(content);

      this.push(file);

      cb();
    }))
}
plugin();
module.exports = plugin;
