<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区 -->
    <el-card>
      <el-row>
        <el-col :span="8">
          <!-- 搜索框 -->
          <el-input placeholder="请输入内容" v-model="queryInfo.query">
            <el-button slot="append" icon="el-icon-search" @click="getOrders"></el-button>
          </el-input>
        </el-col>
      </el-row>

      <!-- 订单列表表格内容区域 -->
      <el-table :data="orderList" stripe border style="width: 100%">
        <el-table-column prop="order_number" label="订单编号"></el-table-column>
        <el-table-column prop="order_price" label="订单价格" width="80px"></el-table-column>
        <el-table-column prop="pay_status" label="是否付款" width="100px">
          <template v-slot="{row}">
            <el-tag type="danger" v-if="row.pay_status === '0'">未付款</el-tag>
            <el-tag type="success" v-else>已付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="is_send" label="是否发货" width="80px"></el-table-column>
        <el-table-column prop="create_time" label="下单时间" max-width="180px">
          <template v-slot="{row}">{{ row.create_time | dateFormat}}</template>
        </el-table-column>
        <el-table-column label="操作" width="160px">
          <template v-slot="{row}">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showBox(row)"></el-button>
            <el-button
              type="success"
              icon="el-icon-location"
              size="mini"
              @click="showProgressBox(row)"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页组件 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[10, 20, 30]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>

      <!-- 修改地址对话框 -->
      <el-dialog
        title="修改地址"
        :visible.sync="addressVisible"
        width="50%"
        @close="addressDialogClosed"
      >
        <!-- 修改地址的表单 -->
        <el-form
          :model="addressForm"
          :rules="addressFormRules"
          ref="addressFormRef"
          label-width="100px"
        >
          <el-form-item label="省市区/县" prop="address1">
            <!-- v-model双向绑定级联选择器选择的值 -->
            <!-- options 绑定数据源 -->
            <el-cascader v-model="addressForm.address1" :options="cityData" @change="handleChange"></el-cascader>
          </el-form-item>
          <el-form-item label="详细地址" prop="address2">
            <el-input v-model="addressForm.address2"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addressVisible = false">取 消</el-button>
          <el-button type="primary" @click="addressVisible = false">确 定</el-button>
        </span>
      </el-dialog>

      <!-- 物流信息对话框 -->
      <el-dialog title="物流进度" :visible.sync="progressVisible" width="50%">
        <!-- timeline时间线 -->
        <el-timeline>
          <el-timeline-item
            v-for="(activity, index) in progressInfo"
            :key="index"
            :timestamp="activity.time"
          >{{activity.context}}</el-timeline-item>
        </el-timeline>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
import cityData from './citydata.js'
export default {
  // 页面为渲染html标签之前发生的钩子
  created () {
    // 获取所有订单信息
    this.getOrders()
  },
  data () {
    return {
      // 订单列表
      orderList: [],
      // 查询条件
      queryInfo: {
        // 查询参数
        query: '',
        // 默认查询第一页
        pagenum: 1,
        // 默认每页显示10条数据
        pagesize: 10
      },
      // 总数
      total: 0,
      // 修改地址对话框默认隐藏
      addressVisible: false,
      // 地址的表单内容
      addressForm: {
        address1: [],
        address2: ''
      },
      // 地址表单的验证规则
      addressFormRules: {
        address1: [{ required: true, message: '请选择省市区县' }],
        address2: [{ required: true, message: '请选择详细地址' }]
      },
      // 城市数据
      cityData,
      // 物流信息对话框默认隐藏
      progressVisible: false,
      // 物流信息
      progressInfo: []
    }
  },
  methods: {
    async getOrders () {
      // 发送get请求需要发送一个对象内含有params的对象
      const { data: res } = await this.$http.get('/orders', { params: this.queryInfo })
      if (res.meta.status !== 200) return
      // console.log(res.data)
      this.orderList = res.data.goods
      // 订单总数量
      this.total = res.data.total
    },
    // 选择更改每页显示条数时
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      // 拿到最新的每页显示数量更新页面
      this.getOrders()
    },
    // 切换当前页时
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      // 拿到最新的当前页更新页面
      this.getOrders()
    },
    // 展示修改地址对话框
    showBox (row) {
      this.addressVisible = true
    },
    // 级联选择器发生选择变化时
    handleChange () { },
    // 修改地址对话框关闭时
    addressDialogClosed () {
      // 清空表单内容
      this.$refs.addressFormRef.resetFields()
    },
    // 展示物流信息对话框
    async showProgressBox (row) {
      const { data: res } = await this.$http.get('/kuaidi/1106975712662')
      if (res.meta.status !== 200) return this.$meesage.error('查询物流信息失败')
      this.progressVisible = true
      this.progressInfo = res.data
      // console.log(res.data)
    }
  }
}
</script>

<style lang="less" scope>
@import '../../plugins/timeline/timeline.css';
@import '../../plugins/timeline-item/timeline-item.css';
</style>
