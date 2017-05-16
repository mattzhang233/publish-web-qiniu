module.exports = {
  path: './publish-web-qiniu',
  uploadSrc: './web/**',
  uploadReg: /(?:href=|src=|url\()['|"]([^\s>"']+?)\?rev=([^\s>"']+?)['|"]/gi,
  onUpload: null,
  onReplace: null,
  qiniuAccess: 'upwff5gK6eYd52avUyB15h4J9CQV9csJHKSrqJQc',
  qiniuSecret: 'R1dHlg1lLlx1ucsl8DfHvyWjYOGiYpGMTBw1CcMa',
  qiniuBucket: 'test',
  qiniuBucketDomain: 'opojd4psd.bkt.clouddn.com'
};
