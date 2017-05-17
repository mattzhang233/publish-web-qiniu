# publish-web-qiniu

上传web资源到七牛云并替换路径

## 安装

```bash
$ npm install --save-dev publish-web-qiniu
```


## 使用

```
var publishWeb = require('publish-web-qiniu');

publishWeb({
  webRoot: './dist',
  webGlobs: './dist/**/*',
  qiniuAccess: '七牛云的access',
  qiniuSecret: '七牛云的secret',
  qiniuBucket: '上传到的bucket',
  qiniuBucketDomain:'bucket域名'
});
```

## API

### publishWeb(options)

#### options

##### webRoot

Type: `string`<br>
Default: `null`

web根路径

##### webGlobs

Type: `glob`<br>
Default: `null`

需要处理的文件glob

##### uploadReg

Type: `regexp`<br>
Default: `/(?:href=|src=|url\()['|"]([^\s>"']+?)['|"]/gi`

上传查找规则

## License

[MIT](http://opensource.org/licenses/MIT)
