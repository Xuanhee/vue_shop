import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import Welcome from '../components/Welcome.vue'
import Users from '../components/user/Users.vue'
import Roles from '../components/power/Roles.vue'
import Rights from '../components/power/Rights.vue'
import EditRole from '../components/power/EditRole.vue'
Vue.use(VueRouter)

const routes = [
  // 当用户打开页面时重定向到登录页面
  { path: '/', redirect: '/login' },
  // 当登录login路由的时候,调用组件Login
  { path: '/login', component: Login },
  // 当用户输入完账号密码后进入主页
  {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [
      // 进入/home路由时自动跳转到welcome路由，其实就是默认home页面显示主要内容
      { path: '/welcome', component: Welcome },
      { path: '/users', component: Users },
      { path: '/roles', component: Roles },
      { path: '/rights', component: Rights },
      { path: '/editRole/:id', component: EditRole }
    ]
  }
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
