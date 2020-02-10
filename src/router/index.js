import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'

Vue.use(VueRouter)

const routes = [
  // 当用户打开页面时重定向到登录页面
  { path: '/', redirect: '/login' },
  // 当登录login路由的时候,调用组件Login
  { path: '/login', component: Login },
  // 当用户输入完账号密码后进入主页
  { path: '/home', component: Home }
]

const router = new VueRouter({
  routes
})

// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
  // to 将要访问的路径
  // from 代表从哪个路径跳转而来
  // next 是一个函数,表示放行
  //    next() 放行  next('/login') 强制跳转
  // 如果用户访问登录页, 直接放行
  if (to.path === '/login') return next()
  // 如果登录了其他页面,就从 sessionStorage中获取到保存的 token值
  const tokenStr = window.sessionStorage.getItem('token')
  // 如果没有token. 强制用户跳转到登录页
  if (!tokenStr) return next('/login')
  next()
})
// 暴露router
export default router
