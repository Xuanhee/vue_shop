// 这个文件是自定义 webpack的配置项 导出一个包含自定义配置选项的对象
module.exports = {
  // 为开发模式和发布模式指定不同的打包入口
  chainWebpack: config => {
    // 生产模式,发布模式
    config.when(process.env.NODE_ENV === 'production', config => {
      config.entry('app').clear().add('./src/main-prod.js')
      // 分离出组件,不打包这些组件,这些组件通过CDN来外部引入,减小打包体积
      config.set('externals', {
        vue: 'Vue',
        'vue-router': 'VueRouter',
        axios: 'axios',
        lodash: '_',
        echarts: 'echarts',
        nprogress: 'NProgress',
        'vue-quill-editor': 'VueQuillEditor'
      })
      // 设置生产模式下 页面标题
      config.plugin('html').tap(args => {
        args[0].isProd = true
        return args
      })
    })
    // 开发模式
    config.when(process.env.NODE_ENV === 'development', config => {
      config.entry('app').clear().add('./src/main-dev.js')
      // 设置开发模式下页面的标题 title
      config.plugin('html').tap(args => {
        args[0].isProd = false
        return args
      })
    })
  }
}
