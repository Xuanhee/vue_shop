import Vue from 'vue'
import VueRouter from 'vue-router'
// 路由懒加载功能实现,首先要在babel.config.js文件中配置插件
// import Login from '../components/Login.vue'
const Login = () => import(/* webpackChunkName: "login_home_welcome" */ '../components/Login.vue')
// import Home from '../components/Home.vue'
const Home = () => import(/* webpackChunkName: "login_home_welcome" */ '../components/Home.vue')
// import Welcome from '../components/Welcome.vue'
const Welcome = () => import(/* webpackChunkName: "login_home_welcome" */ '../components/Welcome.vue')

// import Users from '../components/user/Users.vue'
const Users = () => import(/* webpackChunkName: "Users_Rights_Roles_EditRole" */ '../components/user/Users.vue')
// import Roles from '../components/power/Roles.vue'
const Roles = () => import(/* webpackChunkName: "Users_Rights_Roles_EditRole" */ '../components/power/Roles.vue')
// import Rights from '../components/power/Rights.vue'
const Rights = () => import(/* webpackChunkName: "Users_Rights_Roles_EditRole" */ '../components/power/Rights.vue')
// import EditRole from '../components/power/EditRole.vue'
const EditRole = () => import(/* webpackChunkName: "Users_Rights_Roles_EditRole" */ '../components/power/EditRole.vue')

// import Categories from '../components/goods/Categories.vue'
const Categories = () => import(/* webpackChunkName: "Categories_Params" */ '../components/goods/Categories.vue')
// import Params from '../components/goods/Params.vue'
const Params = () => import(/* webpackChunkName: "Categories_Params" */ '../components/goods/Params.vue')

// import List from '../components/goods/List.vue'
const List = () => import(/* webpackChunkName: "List_Add" */ '../components/goods/List.vue')
// import Add from '../components/goods/Add.vue'
const Add = () => import(/* webpackChunkName: "List_Add" */ '../components/goods/Add.vue')

// import Order from '../components/order/Order.vue'
const Order = () => import(/* webpackChunkName: "Order_Report" */ '../components/order/Order.vue')
// import Report from '../components/report/Report.vue'
const Report = () => import(/* webpackChunkName: "Order_Report" */ '../components/report/Report.vue')
Vue.use(VueRouter)

const routes = [
  // 当用户打开页面时重定向到登录页面
  {
    path: '/',
    redirect: '/login'
  },
  // 当登录login路由的时候,调用组件Login
  {
    path: '/login',
    component: Login
  },
  // 当用户输入完账号密码后进入主页
  {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [
      // 进入/home路由时自动跳转到welcome路由，其实就是默认home页面显示主要内容
      {
        path: '/welcome',
        component: Welcome
      },
      {
        path: '/users',
        component: Users
      },
      {
        path: '/roles',
        component: Roles
      },
      {
        path: '/rights',
        component: Rights
      },
      {
        path: '/editRole/:id',
        component: EditRole
      },
      {
        path: '/categories',
        component: Categories
      },
      {
        path: '/params',
        component: Params
      },
      {
        path: '/goods',
        component: List
      },
      {
        path: '/goods/add',
        component: Add
      },
      {
        path: '/goods/add/:id',
        component: Add
      },
      {
        path: '/orders',
        component: Order
      },
      {
        path: '/reports',
        component: Report
      }
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
