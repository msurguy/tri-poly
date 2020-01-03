module.exports = {
  publicPath: process.env.NODE_ENV === 'production'
    ? '/tri-poly/'
    : '/',
  outputDir: 'docs',
  devServer: {
    port: 8085
  }
}
