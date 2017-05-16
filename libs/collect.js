var vfs = require('vinyl-fs');
var mapStream = require('map-stream');

function main(config) {
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
module.exports = main;

