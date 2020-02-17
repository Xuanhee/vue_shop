// 发布阶段所有按需加载的组件都应该通过 CDN形式来加载,这样可以有效的减少打包后文件的体积
// 发布阶段所有按需加载的组件都应该通过 CDN形式来加载,这样可以有效的减少打包后文件的体积
import Vue from 'vue'
import App from './App.vue'
import router from './router'
// import './plugins/element.js'
import './assets/css/global.css'
// 导入字体图标
import './assets/fonts/iconfont.css'
import axios from 'axios'
import TreeTable from 'vue-table-with-tree-grid'
// 导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
// 导入富文本编辑器对应的样式
// import 'quill/dist/quill.core.css'
// import 'quill/dist/quill.snow.css'
// import 'quill/dist/quill.bubble.css'

// 导入nprogress包对应的 js 和css 文件
import NProgress from 'nprogress'
// import 'nprogress/nprogress.css'
// 配置请求根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'

// 在request拦截器中,展示进度条 NProgress.start()

// 请求拦截,在请求发送之前进行的配置
axios.interceptors.request.use((config) => {
  // 显示进度条
  NProgress.start()
  // 拦截请求头中是否含有 Authorization属性
  config.headers.Authorization = window.sessionStorage.getItem('token')
  // 在最后必须return config
  return config
})
// 在 response拦截器中,隐藏进度条 NProgress.done()
axios.interceptors.response.use((config) => {
  // 隐藏进度条
  NProgress.done()
  return config
})
// 注册组件树形表格
Vue.component('tree-table', TreeTable)
// 将富文本编辑器注册为全局可用的组件
Vue.use(VueQuillEditor)
// 定义一个全局过滤器
Vue.filter('dateFormat', function (originVal) {
  const dt = new Date(originVal)
  const y = dt.getFullYear()
  // 字符串函数 padStart() 参数意思是  不足两位时用0来填充 必须是字符串来调用
  const m = (dt.getMonth() + 1 + '').padStart(2, '0')
  const d = (dt.getDate() + '').padStart(2, '0')
  const hh = (dt.getHours() + '').padStart(2, '0')
  const mm = (dt.getMinutes() + '').padStart(2, '0')
  const ss = (dt.getSeconds() + '').padStart(2, '0')
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})
// 全局配置axios 将axios存入Vue的原形对象中
Vue.prototype.$http = axios

Vue.config.productionTip = false
new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
