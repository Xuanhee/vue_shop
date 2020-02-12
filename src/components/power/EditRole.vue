<template>
  <!-- 修改角色信息 -->
  <div>
    <el-card>
      <!-- 表格 -->
      <el-form
        :model="rolesForm"
        :rules="rolesRules"
        ref="rolesFormRef"
        label-width="100px"
        class="demo-ruleForm edit_Form"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="rolesForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="rolesForm.roleDesc"></el-input>
        </el-form-item>
        <!-- 修改的按钮 -->
        <el-form-item>
          <el-button type="primary" @click="returnRoles(rolesForm)">立即修改</el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>
<script>
export default {
  data () {
    return {
      rolesForm: {
      },
      rolesRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'blur' }
        ],
        roleDesc: [
          { max: 20, message: '最多20个字符', trigger: 'blur' }
        ]
      }
    }
  },
  // 打开页面直接渲染页面获得数据
  created () {
    this.getRole()
  },
  methods: {
    // 点击修改后跳回roles页面
    returnRoles (rolesForm) {
      this.$refs.rolesFormRef.validate(async (valid) => {
        if (!valid) return this.$message.error('请输入正确的角色名和描述')
        // 发送修改请求
        const { data: res } = await this.$http.put('/roles/' + rolesForm.roleId, { roleName: rolesForm.roleName, roleDesc: rolesForm.roleDesc })
        if (res.meta.status !== 200) return this.$message.error('修改角色失败')
        this.$router.push('/roles')
      })
    },
    // 点击清空
    resetForm () {
      this.$refs.rolesFormRef.resetFields()
    },
    async getRole () {
      const { data: res } = await this.$http.get('/roles/' + this.$route.params.id)
      this.rolesForm = res.data
    }
  }
}
</script>
<style lang="less" scope>
.edit_Form {
  width: 60%;
  margin: 0 auto;
}
</style>
