# publish-web-qiniu

通过正则匹配需要上传的文件后上传到七牛云并替换路径

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
  qiniuBucketDomain:'bucket对应域名'
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

上传查找规则，文件路径为模式中的第一个子表达式匹配的字符串

##### uploadedDelete

Type: `boolean`<br>
Default: `false`

上传完成后是否需要删除该文件

##### systemDir

Type: `string`<br>
Default: `./.publish-web-qiniu`

用于写入已上传文件的相对于options.webRoot目录

##### onCollectPath

Type: `function`<br>
Default: `null`

在收集路径是回调，传入参数（匹配到的文件路径，所在文件，本应该返回的路径），返回处理后的匹配文件路径，如果是空字符串则不处理该匹配

##### onFinish

Type: `function`<br>
Default: `null`

在处理完成时回调，可以返回promise

## License

[MIT](http://opensource.org/licenses/MIT)
