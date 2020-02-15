<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 警告区域 -->
      <el-alert title="注意: 只允许为第三级分类设置相关参数" type="warning" show-icon :closable="false"></el-alert>
      <!-- 选择商品分类区域 -->
      <el-row class="cat_opt">
        <el-col>
          <span class="demonstration">选择商品分类：</span>
          <!-- 选择商品分类的级联选择框  -->
          <el-cascader
            v-model="selectKeys"
            :options="categoriesList"
            :props="categories"
            @change="categoryChange"
          ></el-cascader>
        </el-col>
      </el-row>
      <!-- tab标签页区域 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <!-- 添加动态参数面板 -->
        <el-tab-pane label="动态参数" name="many">
          <!-- 添加参数按钮 -->
          <el-button
            @click="addParamsDialogVisible=true"
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
          >添加参数</el-button>
          <!-- 动态参数表单 -->
          <el-table :data="manyTableData" style="width: 100%">
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template v-slot="{row}">
                <el-tag
                  @close="handleClose(index,row)"
                  closable
                  v-for="(item,index) in row.attr_vals"
                  :key="index"
                >{{ item }}</el-tag>
                <!-- 输入的文本框 -->
                <el-input
                  class="input-new-tag"
                  v-if="row.inputVisible"
                  v-model="row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(row)"
                  @blur="handleInputConfirm(row)"
                ></el-input>
                <!-- 添加的按钮 -->
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column prop="attr_name" label="参数名称"></el-table-column>
            <el-table-column prop="address" label="操作">
              <template v-slot="{row}">
                <el-button
                  size="mini"
                  icon="el-icon-edit"
                  type="primary"
                  @click="showEditParamsDialog(row)"
                >编辑</el-button>
                <el-button
                  size="mini"
                  icon="el-icon-delete"
                  type="danger"
                  @click="deleteParams(row)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 添加静态属性面板 -->
        <el-tab-pane label="静态属性" name="only">
          <!-- 添加属性的按钮 -->
          <el-button
            @click="addParamsDialogVisible=true"
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
          >添加属性</el-button>
          <!-- 静态属性表单 -->
          <el-table :data="onlyTableData" style="width: 100%">
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template v-slot="{row}">
                <el-tag
                  @close="handleClose(index,row)"
                  closable
                  v-for="(item,index) in row.attr_vals"
                  :key="index"
                >{{ item }}</el-tag>
                <!-- 输入的文本框 -->
                <el-input
                  class="input-new-tag"
                  v-if="row.inputVisible"
                  v-model="row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(row)"
                  @blur="handleInputConfirm(row)"
                ></el-input>
                <!-- 添加的按钮 -->
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column prop="attr_name" label="属性名称"></el-table-column>
            <el-table-column prop="address" label="操作">
              <template v-slot="{row}">
                <el-button
                  size="mini"
                  icon="el-icon-edit"
                  type="primary"
                  @click="showEditParamsDialog(row)"
                >编辑</el-button>
                <el-button
                  size="mini"
                  icon="el-icon-delete"
                  type="danger"
                  @click="deleteParams(row)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- 添加动态参数对话框 -->
    <el-dialog
      @close="addDialogClosed"
      :title="'添加'+titleText"
      :visible.sync="addParamsDialogVisible"
      width="50%"
    >
      <!-- 添加参数的表单 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addParamsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改参数的对话框 -->
    <el-dialog
      @close="editDialogClosed"
      :title="'修改'+titleText"
      :visible.sync="editParamsDialogVisible"
      width="50%"
    >
      <!-- 修改参数的表单 -->
      <el-form :model="editForm" :rules="addFormRules" ref="editFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editParamsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 商品分类列表
      categoriesList: [],
      //   添加参数对话框默认隐藏
      addParamsDialogVisible: false,
      //   修改参数对话框默认隐藏
      editParamsDialogVisible: false,
      //   级联选择框配置对象
      categories: {
        label: 'cat_name',
        value: 'cat_id',
        expandTrigger: 'hover',
        children: 'children'
      },
      //   级联选择框双向绑定到的数组
      selectKeys: [],
      //   选中的三级分类的id
      activeName: 'many',
      //   动态参数列表
      manyTableData: [],
      //   静态属性列表
      onlyTableData: [],
      // 添加 参数/属性表单值
      addForm: {},
      // 修改 参数/属性表单值
      editForm: {},
      // 定义验证添加表单的验证规则
      addFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' },
          { min: 2, max: 10, message: '长度在 2 到 10 个字符' }
        ]
      }
    }
  },
  created () {
    //   渲染页面 在模板编译进路由之前
    this.getCategories()
  },
  methods: {
    //   获取所有商品分类列表
    async getCategories () {
      const { data: res } = await this.$http.get('/categories')
      if (res.meta.status !== 200) return this.$message.error('获取分类数据失败')
      // console.log(res.data)
      this.categoriesList = res.data
    },
    // 级联选择器发生变化时触发
    categoryChange () {
      // 此函数的参数值和 级联选择器中v-model设置的值是一样的 不过要改变值还需要v-model的值双向绑定
      //   console.log(this.selectKeys === value)
      // 发送请求获取到三级分类的参数列表
      this.getParamsData()
    },
    // tab页签 点击事件的处理函数 也要获取数据
    handleTabClick (tab, event) {
      // 发送请求获取到三级分类的参数列表
      this.getParamsData()
    },
    // 获取参数列表数据 并赋值给不同的数据源的封装函数
    async getParamsData () {
      if (this.selectKeys.length !== 3) {
        this.manyTableData = []
        this.onlyTableData = []
        this.selectKeys = []
        return
      }
      const { data: res } = await this.$http.get('/categories/' + this.selectId + '/attributes', { params: { sel: this.activeName } })
      if (res.meta.status !== 200) return this.$message.error('获取参数列表失败')
      //   获取到返回值需要遍历 每一项拿到每一项的 attr_vals数据 此数据是参数信息
      res.data.forEach(item => {
        //   由于参数信息是空格隔开的,字符串将此值转换为数组
        // 空字符串用空格分隔会拿到一个 值为''的数组,所以要对原字符串进行处理
        // 如果是空字符串则返回一个空数组,反之不是空字符串进行分隔
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        // 控制文本框的显示与隐藏
        item.inputVisible = false
        // 文本框中输入值
        item.inputValue = ''
      })
      //   动态参数表格数据
      if (this.activeName === 'many') this.manyTableData = res.data
      //   静态属性表格数据
      else this.onlyTableData = res.data
    },
    // 监听关闭对话框事件,清空表单内容
    addDialogClosed () {
      this.$refs.addFormRef.resetFields()
    },
    // 监听添加参数/属性事件
    addParams () {
      // 先进行预校验
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) return this.$message.error('您输入的信息不符合标准')
        var { data: res } = await this.$http.post(`/categories/${this.selectId}/attributes`, {
          attr_name: this.addForm.attr_name,
          attr_sel: this.activeName
        })
        console.log(res)
        if (res.meta.status !== 201) return this.$message.error('创建参数失败')
        this.$message.success('添加参数成功')
        //   关闭对话框
        this.addParamsDialogVisible = false
        //   更新数据
        this.getParamsData()
      })
    },
    // 显示修改参数属性对话框
    async showEditParamsDialog (row) {
      // 传递地址参数 分类id 和参数id
      const { data: res } = await this.$http.get(`/categories/${this.selectId}/attributes/${row.attr_id}`, {
        params: { attr_sel: this.activeName }
      })
      if (res.meta.status !== 200) return this.$message.error('获取页面失败')
      this.editParamsDialogVisible = true
      this.editForm = res.data
      // console.log(res)
    },
    // 监听修改参数对话框确定按钮 添加参数
    editParams () {
      // 修改之前预验证
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) return this.$message.error('您输入的数据不符合要求')
        // 验证通过之后发送请求修改数据
        // console.log(this.editForm)
        const { data: res } = await this.$http.put(`/categories/${this.selectId}/attributes/${this.editForm.attr_id}`, {
          attr_name: this.editForm.attr_name,
          attr_sel: this.editForm.attr_sel,
          attr_vals: this.editForm.attr_vals
        })
        // console.log(res)
        if (res.meta.status !== 200) return this.$message.error('修改数据失败')
        this.$message.success('修改数据成功')
        // 更新数据
        this.getParamsData()
        // 关闭修改数据对话框
        this.editParamsDialogVisible = false
      })
    },
    // 监听关闭修改对话框事件 重置修改的表单
    editDialogClosed () {
      this.$refs.editFormRef.resetFields()
    },
    // 监听删除按钮,  删除参数
    async deleteParams (row) {
      const confirm = await this.$confirm('您确定要删除此参数?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirm !== 'confirm') return this.$message.info('已取消删除')
      const { data: res } = await this.$http.delete(`/categories/${this.selectId}/attributes/${row.attr_id}`)
      if (res.meta.status !== 200) return this.$message.error('删除参数失败')
      this.$message.success('删除参数成功')
      // 渲染页面 刷新数据
      this.getParamsData()
    },
    // 监听 添加标签输入框回车或者失去焦点时
    async handleInputConfirm (row) {
      if (row.inputValue.trim().length === 0) {
        row.inputVisible = false
        row.inputValue = ''
        return
      }
      // 如果没有return证明输入的内容需要做后续处理
      row.attr_vals.push(row.inputValue.trim())
      // 隐藏输入框
      row.inputVisible = false
      // 清空输入框内容
      row.inputValue = ''
      // 向服务器端发送请求保存修改的数据
      this.saveAttrVals(row)
    },
    // 点击添加参数标签
    showInput (row) {
      row.inputVisible = true
      //   文本框自动获取焦点
      //   $nextTick 方法的作用
      //   就是当页面上元素被重新渲染后,才会指定回调函数中的代码
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 将对attr_vals的操作保存到数据库
    async saveAttrVals (row) {
      // 发起请求,保存这次操作
      const { data: res } = await this.$http.put(`/categories/${this.selectId}/attributes/${row.attr_id}`, {
        attr_name: row.attr_name,
        attr_sel: this.activeName,
        attr_vals: row.attr_vals.join(' ')
      })
      // console.log(res.data)
      if (res.meta.status !== 200) return this.$message.error('修改参数失败')
      this.$message.success('修改参数操作成功')
    },
    // 监听关闭标签事件 删除标签项
    async handleClose (index, row) {
      const confirm = await this.$confirm('您确定要删除此标签吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirm === 'confirm') {
        row.attr_vals.splice(index, 1)
        this.saveAttrVals(row)
        // console.log(row.attr_vals)
      }
    }
  },
  //   计算属性,值不变时会保存在缓存中减少 减少函数调用操作
  computed: {
    // 判断添加按钮是否禁用,由于只有在三级分类选中是才可以点击,所以设置为计算属性
    isBtnDisabled () {
      //   判断选中是否是三级分类  页面要求只能选择三级分类
      // 未选中三级分类设置添加参数按钮为禁止状态
      if (this.selectKeys.length !== 3) return true
      return false
    },
    // 同理选中三级分类时才获取到三级分类的id   防止一些多余的操作也进行id值的计算
    selectId () {
      if (this.selectKeys.length !== 3) return null
      // 给选择到的三级分类赋值
      else return this.selectKeys[2]
    },
    // 动态计算标题的文本
    titleText () {
      if (this.activeName === 'many') return '动态参数'
      else return '静态属性'
    }
  }
}
</script>

<style lang="less" scope>
.cat_opt {
  margin: 15px 0;
}
.input-new-tag input {
  width: 150px;
}
</style>
