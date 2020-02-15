<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区 -->
    <el-card>
      <!-- 搜索和添加按钮 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" clearable v-model="queryInfo.query" @clear="getGoodsList">
            <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="goAddpage">添加商品</el-button>
        </el-col>
      </el-row>
      <!-- 显示列表表格 -->
      <el-table :data="goodsList" stripe border style="width: 100%">
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="goods_name" label="商品名称"></el-table-column>
        <el-table-column prop="goods_price" label="商品价格(元)" width="95px"></el-table-column>
        <el-table-column prop="goods_number" label="商品重量" width="80px"></el-table-column>
        <el-table-column prop="add_time" label="创建时间" width="140px">
          <!-- 利用作用域插槽对日期格式进行设置 渲染过滤器-->
          <template v-slot="{row}">{{row.add_time | dateFormat}}</template>
        </el-table-column>
        <el-table-column label="操作" width="150px">
          <template v-slot="{row}">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="goEditPage(row)"></el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeById(row)"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <div class="block">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="queryInfo.pagenum"
          :page-sizes="[10, 20, 30, 40]"
          :page-size="queryInfo.pagesize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
        ></el-pagination>
      </div>
    </el-card>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 商品列表
      goodsList: [],
      // 商品总数
      total: 0,
      // 查询参数对象
      queryInfo: {
        // 查询的关键字
        query: '',
        // 默认显示第一页
        pagenum: 1,
        // 默认每页显示10个数据
        pagesize: 10
      }
    }
  },
  // 生命周期函数
  created () {
    this.getGoodsList()
  },
  methods: {
    // 获取商品列表
    async getGoodsList () {
      const { data: res } = await this.$http.get('/goods', { params: this.queryInfo })
      if (res.meta.status !== 200) return this.$message.error('获取商品列表失败')
      // 给商品列表赋值
      this.goodsList = res.data.goods
      //   获得总商品数
      this.total = res.data.total
    },
    // 当每页显示条数发生变化时
    handleSizeChange (newSize) {
      // 获取到当前每页显示的数量
      this.queryInfo.pagesize = newSize
      this.getGoodsList()
    },
    // 当前点击页发生变化时
    handleCurrentChange (newPage) {
      // 获取到当前页
      this.queryInfo.pagenum = newPage
      this.getGoodsList()
    },
    // 监听删除按钮
    async removeById (row) {
      const confirm = await this.$confirm('你确定要删除此商品吗？', '提示', {
        confrimButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(async err => err)
      if (confirm !== 'confirm') return this.$message.info('已取消删除')
      const { data: res } = await this.$http.delete('/goods/' + row.goods_id)
      if (res.meta.status !== 200) return this.$message.error('删除商品失败')
      this.$message.success('删除商品成功')
      //   此做法避免删除最后一个一条数据时不跳转到前一页面的情况
      const totalPage = Math.ceil((this.total - 1) / this.queryInfo.pagesize)
      this.queryInfo.pagenum = this.queryInfo.pagenum > totalPage ? totalPage : this.queryInfo.pagenum
      this.getGoodsList()
    },
    // 监听添加商品按钮 跳转到添加商品页面
    goAddpage () {
      this.$router.push('/goods/add')
    },
    goEditPage (row) {
      this.$router.push(`/goods/add/${row.goods_id}`)
    }
  }
}
</script>

<style lang="less" scope>
</style>
