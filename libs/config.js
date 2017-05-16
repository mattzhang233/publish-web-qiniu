module.exports = {
  path: './web/**',
  uploadReg: /(?:href=|src=|url\()['|"]([^\s>"']+?)['|"]/gi,
  onUpload: null,
  onReplace: null,
  qiniuAccess: 'upwff5gK6eYd52avUyB15h4J9CQV9csJHKSrqJQc',
  qiniuSecret: 'R1dHlg1lLlx1ucsl8DfHvyWjYOGiYpGMTBw1CcMa',
  qiniuBucket: 'test',
  qiniuBucketDomain: 'opojd4psd.bkt.clouddn.com',
  tempPath: './publish-web-qiniu'
};
