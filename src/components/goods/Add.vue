<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>{{addOrEdit}}</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 提示区域 -->
      <el-alert :title="addOrEdit + '信息'" type="info" center show-icon :closable="false"></el-alert>
      <!-- 步骤条区域  这里拿到的索引值是数值 , 所以需要将绑定的字符串进行转化为数值-->
      <el-steps :space="200" :active="activeIndex-0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!-- 表单要在外层 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
        label-position="top"
      >
        <!-- tabs标签页 -->
        <el-tabs
          v-model="activeIndex"
          tab-position="left"
          :before-leave="beforeTabLeave"
          @tab-click="tabClicked()"
        >
          <!-- 基本信息页面 -->
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <!-- 级联选择器 -->
              <el-cascader
                v-model="addForm.goods_cat"
                :options="categories"
                :props="categoriesProps"
                @change="handleChange"
                clearable
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <!-- 渲染表单的item项 -->
            <el-form-item :label="item.attr_name" v-for="(item,i) in manyTableData" :key="i">
              <!-- 复选框组 -->
              <el-checkbox-group v-if="addOrEdit==='添加商品'" v-model="item.attr_vals" size="mini">
                <el-checkbox border :label="item2" v-for="(item2,i2) in item.attr_vals" :key="i2"></el-checkbox>
              </el-checkbox-group>
              <el-checkbox-group v-else v-model="item.attr_value" size="mini">
                <el-checkbox border :label="item2" v-for="(item2,i2) in item.attr_value" :key="i2"></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <!-- 商品属性的表单 -->
            <el-form-item :label="item.attr_name" v-for="(item,i) in onlyTableData" :key="i">
              <el-input v-model="item.attr_vals" v-if="addOrEdit==='添加商品'"></el-input>
              <el-input v-model="item.attr_value" v-else></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <!-- 图片上传  不会调用axios 需要手动设置一个请求头-->
            <!-- action 表示图片上传到后台的地址 -->
            <el-upload
              :action="uploadUrl"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="headerObj"
              :on-success="handleSuccess"
              :file-list="fileList"
            >
              <el-button size="small" type="primary">点击上传</el-button>
              <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑器组件 -->
            <quill-editor v-model="addForm.goods_introduce" ref="myQuillEditor"></quill-editor>
            <el-button
              type="primary"
              class="btnAdd"
              @click="add"
              v-if="addOrEdit=='添加商品'"
            >{{addOrEdit}}</el-button>
            <el-button type="primary" class="btnAdd" @click="edit" v-else>{{addOrEdit}}</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <!-- 图片预览的对话框 -->
    <el-dialog title="图片预览" :visible.sync="previewVisible" width="50%">
      <img :src="previewPath" width="100%" />
      <span slot="footer" class="dialog-footer">
        <el-button @click="previewVisible = false">取 消</el-button>
        <el-button type="primary" @click="previewVisible = false">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import _ from 'lodash'
export default {
  data () {
    return {
      // 当前步骤状态的索引 和tabs进行绑定 v-model绑定的是name的值
      activeIndex: 0,
      // 添加商品的表单数据对象
      addForm: {
        goods_cat: [],
        // 上传图片的路径
        pics: [],
        // 商品的详情描述
        goods_introduce: '',
        // 商品的参数
        attrs: []
      },
      //   表单数据的验证规则
      addFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' },
          { min: 2, max: 55, message: '长度在 2 到 55 个字符' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' }
        ],
        goods_cat: [
          { required: true, message: '请选择商品分类', trigger: 'blur' }
        ]
      },
      // 级联选择框选择的id
      selectId: 0,
      // 级联选择框所有分类的数据
      categories: [],
      // 级联选择框配置规则
      categoriesProps: {
        expandTrigger: 'hover',
        label: 'cat_name',
        value: 'cat_id',
        children: 'children'
      },
      // 动态参数和属性名称
      titleText: '',
      // 获取到的动态参数列表
      manyTableData: [],
      // 获取到的静态属性列表
      onlyTableData: [],
      //   上传图片的url地址
      uploadUrl: 'http://127.0.0.1:8888/api/private/v1/upload',
      //   图片上传组件的headers请求头
      headerObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      // 图片预览地址
      previewPath: '',
      // 图片预览对话框默认隐藏
      previewVisible: false,
      // 上传文件的列表
      fileList: []
    }
  },
  //   生命周期函数钩子 模板还没有被渲染成html
  created () {
    this.getCategories()
    this.getGoods()
  },
  methods: {
    // 根据id查询商品信息
    async getGoods () {
      const { data: res } = await this.$http.get(`/goods/${this.$route.params.id}`)
      if (res.meta.status !== 200) return
      const data = res.data
      //   渲染默认级联选择器的值
      data.goods_cat = data.goods_cat.split(',').map(Number)
      // 遍历获取动态参数和静态属性的值
      data.attrs.forEach(item => {
        if (item.attr_sel === 'only') this.onlyTableData.push(item)
        if (item.attr_sel === 'many') this.manyTableData.push(item)
      })
      //   进行赋值操作
      this.addForm = data
      this.addForm.pics.forEach(item => {
        this.fileList.push({ name: item.pics_id, url: item.pics_mid_url })
      })
      console.log(this.addForm)
    },
    //   级联选择框发生变化时触发
    handleChange (value) {
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = []
      }
      //   console.log(this.addForm.goods_cat)
    },
    // 获取所有分类
    async getCategories () {
      const { data: res } = await this.$http.get('/categories')
      if (res.meta.status !== 200) return this.$message.error('获取分类列表失败')
      this.categories = res.data
    },
    // 切换Tab栏之前监听的事件
    beforeTabLeave (activeName, oldActiveName) {
      if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
        this.$message.error('请先选择商品分类')
        return false
      }
    },
    // 当标签页发生切换时触发
    async tabClicked () {
      // 证明访问的是动态参数面板
      if (this.activeIndex === '1' && this.addOrEdit === '添加商品') {
        this.titleText = 'many'
        this.getAttrData()
      }
      // 证明访问的是静态属性面板
      if (this.activeIndex === '2' && this.addOrEdit === '添加商品') {
        this.titleText = 'only'
        this.getAttrData()
        // console.log(this.onlyTableData)
      }
      console.log(this.addForm)
      console.log(this.manyTableData)
    },
    // 动态获取参数 和 属性的值
    async getAttrData () {
      const { data: res } = await this.$http.get(`/categories/${this.cateId}/attributes/?sel=${this.titleText}`)
      if (res.meta.status !== 200) return this.$message.error('获取动态参数列表失败')
      // 将获取到的动态参数字符串转为数组  静态属性还是保持字符串形式
      if (this.titleText === 'many') {
        res.data.forEach(item => {
          item.attr_vals = item.attr_vals ? item.attr_vals.split(',') : []
        })
        this.manyTableData = res.data
      } else this.onlyTableData = res.data
    },
    // 处理图片预览效果
    handlePreview (file) {
      console.log(file)
      this.previewPath = file.url
      this.previewVisible = true
    },
    // 处理图片移除效果
    handleRemove (file) {
      // 1.获取将要删除的图片临时路径
      // 2.从pics数组中,找到这个图片对应的索引
      // 3.调用数组 splice方法把图片信息对象,从pics数组中移除
      const tmpPath = file.url
      const index = this.addForm.pics.findIndex(item => item.pic === tmpPath)
      // 此方法是响应式的
      this.addForm.pics.splice(index, 1)
      //   console.log(this.addForm)
    },
    // 文件上传成功时触发
    handleSuccess (response) {
      // 拼接得到一个图片信息对象
      //   将图片信息对象push到pics数组中
      this.addForm.pics.push({ pic: response.data.tmp_path })
    },
    // 添加商品
    add () {
      // 对前面的必填表单进行预验证
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return this.$message.error('请完善基本页面信息')
        // 验证通过之后添加商品
        // 处理动态参数
        this.manyTableData.forEach(item => {
          this.addForm.attrs.push({ attr_id: item.attr_id, attr_value: item.attr_vals.join('') })
        })
        // 处理静态属性
        this.onlyTableData.forEach(item => {
          //   console.log(item.attr_id)
          //   console.log(item.attr_vals)
          this.addForm.attrs.push({ attr_id: item.attr_id, attr_value: item.attr_vals })
        })
        // lodash cloneDeep(obj) 深拷贝,因为表单中会存在双向绑定,所以深拷贝一份来处理不影响表单中的值
        const form = _.cloneDeep(this.addForm)
        form.goods_cat = form.goods_cat.join(',')
        console.log(form)
        // 发起请求添加商品, 商品名称必须是唯一的
        const { data: res } = await this.$http.post('/goods', form)
        if (res.meta.status !== 201) this.$message.error('添加商品失败')
        this.$message.success('添加商品成功')
        // 跳转到商品列表页面
        this.$router.push('/goods')
      })
    },
    // 编辑商品
    async edit () {
      const confirm = await this.$confirm('确认修改商品信息?', '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirm !== 'confirm') this.$message.info('取消修改操作')
      //   确认修改对发送的参数进行设置之后发送请求
      //   清空参数数组 重新赋值
      this.addForm.attrs = []
      // 处理动态参数
      await this.manyTableData.forEach(item => {
        this.addForm.attrs.push({ attr_id: item.attr_id, attr_value: item.attr_vals.join('') })
      })
      // 处理静态属性
      await this.onlyTableData.forEach(item => {
        //   console.log(item.attr_id)
        //   console.log(item.attr_vals)
        this.addForm.attrs.push({ attr_id: item.attr_id, attr_value: item.attr_value })
      })
      //   获取级联选择值,上传给后台 ,后台要转换成字符串,所以需要复制一下传送体
      const form = _.cloneDeep(this.addForm)
      form.goods_cat = form.goods_cat.join(',')
      //   处理完成之后发送修改请求
      const { data: res } = await this.$http.put(`/goods/${this.$route.params.id}`, {
        goods_name: this.addForm.goods_name,
        goods_price: this.addForm.goods_price,
        goods_number: this.addForm.goods_number,
        goods_weight: this.addForm.goods_weight,
        goods_introduce: this.addForm.goods_introduce,
        goods_cat: form.goods_cat,
        pics: this.addForm.pics,
        attrs: this.addForm.attrs
      })
      console.log(this.addForm)
      if (res.meta.status !== 200) return this.$message.error('修改商品信息失败')
      this.$message.success('修改商品操作成功')
      //   跳转到商品列表页面
      this.$router.push('/goods')
    }
  },
  // 计算属性
  computed: {
    // 三级分类的id
    cateId () {
      // 如果选中那么直接返回三级分类的id
      if (this.addForm.goods_cat.length === 3) return this.addForm.goods_cat[2]
      // 否则表明没有选中三级分类,选中一个空值
      return null
    },
    // 添加还是编辑的标题
    addOrEdit () {
      return this.$route.params.id ? '编辑商品' : '添加商品'
    }
  }
}
</script>

<style lang="less" scope>
.el-checkbox {
  margin: 0 5px !important;
}
.btnAdd {
  margin-top: 15px;
}
</style>
