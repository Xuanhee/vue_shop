<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 会把内容包起来-->
    <el-card class="box-card">
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>
      <!-- 表格显示 -->
      <tree-table
        class="treeTable"
        :data="categoriesList"
        :columns="cloumns"
        empty-text="暂无数据"
        :selection-type="false"
        :expand-type="false"
        show-index
        index-text="#"
        border
      >
        <!--是否有效 #是 :vslot的缩写 -->
        <template #isok="{row}">
          <i class="el-icon-error" v-if="row.cat_deleted=== true" style="color: red;"></i>
          <i class="el-icon-success" v-else style="color: lightgreen;"></i>
        </template>
        <!-- 排序 -->
        <template #order="{row}">
          <el-tag v-if="row.cat_level===0" size="mini">一级</el-tag>
          <el-tag type="success" size="mini" v-else-if="row.cat_level===1">二级</el-tag>
          <el-tag type="warning" size="mini" v-else>三级</el-tag>
        </template>
        <!-- 操作 -->
        <template #opt="{row}">
          <el-button
            type="primary"
            icon="el-icon-edit"
            size="mini"
            @click="showEditCategories(row)"
          >编辑</el-button>
          <el-button
            type="danger"
            icon="el-icon-delete"
            size="mini"
            @click="delectCategories(row)"
          >删除</el-button>
        </template>
      </tree-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
    <!-- 添加分类的对话框 -->
    <el-dialog title="添加分类" :visible.sync="cateDialogVisible" width="50%" @close="clearCategory">
      <el-form
        :model="categoriesForm"
        :rules="categoriesRules"
        ref="categoriesFormRef"
        label-width="100px"
        class="demo-ruleForm"
      >
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="categoriesForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类" prop="cat_leve">
          <!-- 级联组件  -->
          <!-- options 用来指定数据源
          props 用来指定配置对象-->
          <el-cascader
            v-model="selectKeys"
            :options="parentCateList"
            :props="cascaderProps"
            @change="parentCategoryChange"
            clearable
            filterable
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate()">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改分类的对话框 -->
    <el-dialog title="修改分类" :visible.sync="editCateDialogVisible" width="50%">
      <!-- 修改分类的表单 -->
      <el-form
        :model="editCateForm"
        :rules="categoriesRules"
        ref="editCateFormRef"
        label-width="100px"
        class="demo-ruleForm"
      >
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="editCateForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCategory">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data () {
    return {
      // 设置一个查询条件 默认出查询的等级还有显示第几页和每页显示几条数据
      queryInfo: {
        type: [3],
        pagenum: 1,
        pagesize: 5
      },
      //   获取一个查询结果总数（分类总数）
      total: 0,
      // 获取到的分类列表
      categoriesList: [],
      //   定义树形表格中没列的数据格式
      cloumns: [{
        label: '分类名称',
        prop: 'cat_name'
      }, {
        label: '是否有效',
        // 表示当前列定义为模板列
        type: 'template',
        // 当前这一列使用的模板名称
        template: 'isok'
      }, {
        label: '排序',
        // 表示当前列定义为模板列
        type: 'template',
        // 当前这一列使用的模板名称
        template: 'order'
      }, {
        label: '操作',
        type: 'template',
        template: 'opt'
      }],
      //   设置添加分类对话框默认隐藏
      cateDialogVisible: false,
      //   设置修改分类对话框默认隐藏
      editCateDialogVisible: false,
      //   声明添加的分类数据
      categoriesForm: {
        // 父级分类id
        cat_pid: 0,
        // 将要添加的分类名称
        cat_name: '',
        // 默认添加的分类是1级分类
        cat_level: 0
      },
      //   声明修改分类的数据
      editCateForm: {},
      //   父级分类的列表数据
      parentCateList: [],
      //   设置级联组件的配置规则
      cascaderProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        checkStrictly: true
      },
      // 选择出来父级id数组
      selectKeys: [],
      // 设置分类的规则
      categoriesRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' },
          { min: 2, max: 10, message: '长度在 2 到 10 个字符' }
        ]
      }
    }
  },
  //   创建页面勾子
  created () {
    //   调用获取分类数据的方法
    this.getCategories()
  },
  methods: {
    // 获取分类的方法 渲染页面
    async getCategories () {
      // get请求要传递参数时候必须传递一个 对象,对象的内部是一个 params对象    （也就是说参数必须是对象的对象）
      const { data: res } = await this.$http.get('/categories', { params: this.queryInfo })
      if (res.meta.status !== 200) return this.$message.error('获取商品分类数据失败')
      //   把响应和回来的数据列表赋值
      this.categoriesList = res.data.result
      //   为总数据条数赋值
      this.total = res.data.total
      //   console.log(res.data)
    },
    // 监听 点击编辑分类按钮
    async showEditCategories (row) {
      const { data: res } = await this.$http.get('/categories/' + row.cat_id)
      console.log(res)
      if (res.meta.status !== 200) return this.$message.error('编辑分类失败')
      this.editCateDialogVisible = true
      this.editCateForm = res.data
    },
    // 监听 点击添加分类对话框的确认
    editCategory () {
      this.$refs.editCateFormRef.validate(async (valid) => {
        if (!valid) return this.$message.error('分类名称不符合要求')
        // 预验证通过之后向服务器端发送请求
        const { data: res } = await this.$http.put('/categories/' + this.editCateForm.cat_id, { cat_name: this.editCateForm.cat_name })
        console.log(res)
        if (res.meta.status !== 200) return this.$message.error('修改分类失败')
        this.$message.success('修改分类操作成功')
        // 关闭修改对话框
        this.editCateDialogVisible = false
        // 重新渲染页面
        this.getCategories()
      })
    },
    // 删除分类
    async delectCategories (row) {
      const confirm = await this.$confirm('您确定要删除此分类?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).catch(error => error)
      if (confirm === 'confirm') {
        const { data: res } = await this.$http.delete('/categories/' + row.cat_id)
        if (res.meta.status !== 200) return this.$message.error('删除分类操作失败')
        // 删除成功之后原本的页面值并没有发生变化,数据是少了默认还在最后一页,所以需要修改当前页数据,如果删除的是最后一个数据,那么就要重新再渲染页面
        const totalPage = Math.ceil((this.total - 1) / this.queryInfo.pagesize)
        this.queryInfo.pagenum = this.queryInfo.pagenum > totalPage ? totalPage : this.queryInfo.pagenum
        // 重新渲染页面 更新数据
        this.getCategories()
      }
    },
    // 监听pagesize改变的事件 点击切换每页显示数量时
    handleSizeChange (val) {
      this.queryInfo.pagesize = val
      this.getCategories()
    },
    // 监听pagenum改变的事件 点击切换页码时显示的数据
    handleCurrentChange (val) {
      // 赋值要显示的新的页数
      this.queryInfo.pagenum = val
      this.getCategories()
    },
    // 监听添加分类事件
    showAddCateDialog () {
      // 显示添加分类的对话框
      this.cateDialogVisible = true
      this.getParentCateList()
      console.log(this.categoriesForm)
    },
    // 获取父级分类的数据列表
    async getParentCateList () {
      const { data: res } = await this.$http.get('/categories', { params: { type: 2 } })
      if (res.meta.status !== 200) return this.$mesaage.error('获取父级分类数据失败')
      this.parentCateList = res.data
    },
    // 监听添加分类对话框中的确定
    addCate () {
      this.$refs.categoriesFormRef.validate(async (valid) => {
        //   预验证表单内容
        if (!valid) return this.$message.error('分类添加信息有误')
        // 发送请求添加分类
        const { data: res } = await this.$http.post('/categories', this.categoriesForm)
        console.log(res)
        if (res.meta.status !== 201) return this.$message.error('添加分类失败')
        this.$message.success('添加分类操作成功')
        // 隐藏添加分类对话框
        this.cateDialogVisible = false
        // 重新渲染页面
        this.getCategories()
      })
    },
    // 选择分类产生变化时
    parentCategoryChange (value) {
      //   console.log(this.categoriesForm)
      //   如果selectKeys 的长度大于0则表示有选中父级分类 反之表示没有选中父级分类
      // 父级id是数组中最后一个值 将获取到的父级id赋值给声明的添加分类数据
      if (this.selectKeys.length > 0) {
        this.categoriesForm.cat_pid = this.selectKeys[this.selectKeys.length - 1]
        //   为当前分类的等级赋值 如果有父级那么level也要设置,有几个父级就设置level是几
        this.categoriesForm.cat_level = this.selectKeys.length
      } else {
        //   如果没有父级则当前分类就是要创建的一级分类,那么必须也给当前分类重新赋值
        this.categoriesForm.cat_level = 0
        this.categoriesForm.cat_pid = 0
      }
    },
    // 关闭对话框后应该清空对话框的内容
    clearCategory () {
      // 清空选中的选项
      this.selectKeys = []
      this.categoriesForm = {}
    }
  }
}
</script>
<style lang="less" scope>
.treeTable {
  margin-top: 15px;
}
</style>
