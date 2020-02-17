<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card class="box-card">
      <!-- 搜索与添加区域 利用栅格布局 -->
      <el-row :gutter="20">
        <el-col :span="10">
          <el-input
            placeholder="请输入内容"
            class="input-with-select"
            v-model.trim="queryInfo.query"
            clearable
            @clear="getUsers"
            @input="getUsers"
          >
            <el-button slot="append" icon="el-icon-search" @click="getUsers"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="dialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 用户列表区域 -->
      <el-table :data="userList" style="width: 100%" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="username" label="用户名"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="mobile" label="电话"></el-table-column>
        <el-table-column prop="role_name" label="角色"></el-table-column>
        <el-table-column label="状态">
          <!-- 通过解构拿到作用域插槽的值 状态值-->
          <template v-slot="{row}">
            <el-switch v-model="row.mg_state" @change="changeState(row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column prop label="操作" width="180px">
          <template v-slot="{row}">
            <el-row>
              <!-- 修改按钮 -->
              <el-tooltip content="修改" placement="top" :hide-after="800" :enterable="false">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  @click="showEditDialog(row.id)"
                  size="mini"
                ></el-button>
              </el-tooltip>
              <!-- 删除按钮 -->
              <el-tooltip content="删除" placement="top" :hide-after="800" :enterable="false">
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="removeUserById(row.id)"
                ></el-button>
              </el-tooltip>
              <!-- 分配角色按钮 -->
              <el-tooltip content="分配角色" placement="top" :hide-after="800" :enterable="false">
                <el-button
                  type="warning"
                  icon="el-icon-star-off"
                  size="mini"
                  @click="showEditRoles(row)"
                ></el-button>
              </el-tooltip>
            </el-row>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 10, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
    <!-- 对话框 作用是添加用户的数据 -->
    <el-dialog
      title="添加用户"
      :visible.sync="dialogVisible"
      width="50%"
      @close="addDialogClosed(addFrom)"
    >
      <el-form
        :model="addFrom"
        :rules="addFromRules"
        ref="addFromRef"
        label-width="70px"
        class="add_Form"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addFrom.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addFrom.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addFrom.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="addFrom.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改用户对话框 -->
    <el-dialog title="修改用户" :visible.sync="editDialogVisible" width="40%">
      <el-form
        :model="editForm"
        :rules="editFormRules"
        ref="editFormRef"
        label-width="70px"
        class="edit_Form"
      >
        <el-form-item label="用户名">
          <el-input disabled :value="editForm.username"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUser(editForm.id)">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配角色对话框 -->
    <el-dialog
      title="提示"
      :visible.sync="editRolesDialogVisible"
      width="40%"
      @close="setRoleDialogClosed"
    >
      <div>
        <p>当前的用户：{{userInfo.username}}</p>
        <p>当前角色：{{userInfo.role_name}}</p>
        <span>分配角色：</span>
        <!-- 选择器,选择要分配的角色 -->
        <el-select v-model="selectRoleId" placeholder="请选择角色">
          <el-option
            v-for="item in rolesList"
            :key="item.id"
            :label="item.roleName"
            :value="item.id"
          ></el-option>
        </el-select>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editRolesDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="savaRoleInfo()">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data () {
    // 验证邮箱的规则
    var checkEmail = (rule, value, callback) => {
      // 验证邮箱的正则表达式
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
      if (regEmail.test(value)) {
        callback()
      } else {
        callback(new Error('请输入正确邮箱'))
      }
    }
    // 验证手机号规则
    var checkMobile = (rule, value, callback) => {
      // 验证手机号的正则表达式
      const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
      if (regMobile.test(value)) {
        return callback()
      } else callback(new Error('请输入正确手机号'))
    }
    return {
      // 获取用户列表,可以直接传入axios的get请求的参数中,不过建议写在这里
      queryInfo: {
        // 搜索关键字
        query: '',
        // 当前页数
        pagenum: 1,
        // 当前每页显示多少条数据
        pagesize: 2
      },
      // 保存用户列表
      userList: [],
      // 总用户数量
      total: 0,
      // 添加用户数据的列表
      addFrom: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 查询到的要修改用户的数据列表
      editForm: {},
      // 添加用户的对话框显示与隐藏
      dialogVisible: false,
      // 修改用户的对话框显示与隐藏
      editDialogVisible: false,
      // 分配角色对话框默认是隐藏
      editRolesDialogVisible: false,
      // 需要被分配角色的用户信息
      userInfo: {},
      // 获取到所有角色信息 角色信息列表
      rolesList: [],
      // 选择到的角色的id值
      selectRoleId: '',
      // 添加用户时表单的验证规则(在发送请求之前做的预验证）
      addFromRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '用户名的长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 3, max: 15, message: '密码的长度在 3 到 15 个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, validator: checkMobile, trigger: 'blur' }
        ]
      },
      // 修改用户数据时的表单 预验证
      editFormRules: {
        email: [
          { required: true, validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, validator: checkMobile, trigger: 'blur' }
        ]
      }
    }
  },
  created () {
    this.getUsers()
  },
  methods: {
    // getUsers获取用户列表,每当用户有新的操作发生时都应该调用此方法 重新渲染页面
    async getUsers () {
      // get参数要传递参数要么直接写在请求地址中, 要么传递一个对象,内是params对象 解构出data数据
      const { data: res } = await this.$http.get('users', { params: this.queryInfo })
      // console.log(res)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.userList = res.data.users
      this.total = res.data.total
    },
    // 监听pagesize改变的事件 获取到每页几个数据
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      // 将获取到的每页几条的新数据再重新赋值到data中,然后重新发送请求渲染最新数据的页面
      this.getUsers()
    },
    // 当前页变动时候触发的事件
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getUsers()
    },
    // 点击修改状态
    async changeState (row) {
      const { data: res } = await this.$http.put('/users/' + row.id + '/state/' + row.mg_state)
      // console.log(res)
      if (res.meta.status !== 200) {
        // 如果设置状态失败请求没发出去,但是页面的值变了,这里要修改让页面的值变回点之前的值
        row.msg_state = !row.msg_state
        this.getUsers()
        return this.$message.error('更新用户状态失败')
      }
      this.$message.success(res.meta.msg)
    },
    // 监听关闭对话框事件 关闭后清空表单内容
    addDialogClosed (addFromRef) {
      this.$refs.addFromRef.resetFields()
    },
    // 点击添加用户对话框中确定按钮进行表单预验证
    addUser () {
      this.$refs.addFromRef.validate(async (valid) => {
        // 点击确认按钮进行预校验,通过了才能发送请求,不通过不发送请求,防止错误点击
        if (!valid) return this.$message.error('您输入的信息有误')
        // 可以发起添加用户的网络请求
        const { data: res } = await this.$http.post('users', this.addFrom)
        // console.log(res)
        if (res.meta.status !== 201) return this.$message.error('用户添加失败')
        this.$message.success('用户添加成功')
        // 用户添加成功后隐藏添加对话框
        this.dialogVisible = false
        // 重新渲染页面
        this.getUsers()
        // console.log(res)
      })
    },
    // 展示编辑用户的对话框
    async showEditDialog (id) {
      const { data: res } = await this.$http.get('/users/' + id)
      // console.log(res)
      if (res.meta.status !== 200) return this.$message.error('修改用户操作无效')
      this.editDialogVisible = true
      this.editForm = res.data
    },
    // 点击修改用户对话框中的确定 进行表单预验证和发送请求
    editUser (id) {
      this.$refs.editFormRef.validate(async (valid) => {
        // console.log(valid)
        // 点击确认按钮进行预效验,防止用户误操作无数据就发送请求
        if (!valid) return this.$message.error('修改用户验证失败')
        // 校验成功之后发送修改用户数据请求  根据接口要求发送的参数只能是邮箱和手机号
        const { data: res } = await this.$http.put('/users/' + id, {
          email: this.editForm.email,
          mobile: this.editForm.mobile
        })
        if (res.meta.status !== 200) return this.$message.error('更新用户信息失败')
        // 关闭对话框
        this.editDialogVisible = false
        // 刷新渲染页面的数据列表
        this.getUsers()
        // 提示成功信息
        this.$message.success('更新用户信息成功')
      })
    },
    // 点击删除按钮弹出删除框 根据id删除指定用户
    async removeUserById (id) {
      // 弹框提问用户是否删除数据
      const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch((err) => err)
      // 如果用户确认删除则返回 confirm, 否则返回cancel
      if (confirmResult !== 'confirm') return this.$message.info('已取消删除')
      const { data: res } = await this.$http.delete('/users/' + id)
      if (res.meta.status !== 200) return this.$message.error('删除操作失败')
      this.$message.success('删除成功!')
      // 因为删除后有可能是最后一页的数据,此时的pagenum无法更新,所以需要手动设置出pagenum的值然后再更新页面
      const totalPage = Math.ceil((this.total - 1) / this.queryInfo.pagesize)
      this.queryInfo.pagenum = this.queryInfo.pagenum > totalPage ? totalPage : this.queryInfo.pagenum
      // 删除成功后更新数据
      this.getUsers()
    },
    // 展开分配角色按钮 通过用户id查询到角色id
    async showEditRoles (row) {
      this.editRolesDialogVisible = true
      const { data: res } = await this.$http.get('/roles')
      if (res.meta.status !== 200) return this.$message.error('查询失败')
      this.userInfo = row
      this.rolesList = res.data
      // console.log(this.rolesList)
    },
    // 点击分配角色对话框的确认按钮,修改用户的角色信息
    async savaRoleInfo () {
      // 如果用户没有选择就点了确定,则需要给出警告提示 程序不发送请求,对话框也不隐藏
      if (!this.selectRoleId) return this.$message.info('请选择要分配的角色')
      const { data: res } = await this.$http.put(`/users/${this.userInfo.id}/role`, { rid: this.selectRoleId })
      if (res.meta.status !== 200) return this.$message.error('角色分配失败')
      this.$message.success('该用户角色修改成功')
      // 关闭对话框
      this.editRolesDialogVisible = false
      // 重新渲染页面
      this.getUsers()
    },
    // 监听角色分配对话框关闭的事件 清空数据
    setRoleDialogClosed () {
      this.userInfo = ''
      this.selectRoleId = ''
    }
  }
}
</script>

<style lang="less" scope>
.add_Form,
.edit_Form {
  width: 60%;
  margin: 0 auto;
}
</style>
