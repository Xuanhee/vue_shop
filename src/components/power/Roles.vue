<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card class="box-card">
      <el-row>
        <el-col>
          <!-- 添加角色按钮区 -->
          <el-button type="primary">添加角色</el-button>
        </el-col>
      </el-row>
      <el-table :data="rolesList" style="width: 100%" border stripe>
        <!-- type = expand是一个可展开按钮 -->
        <el-table-column type="expand" lable="?">
          <template v-slot="{row}">
            <el-row
              v-for="(item,index) in row.children"
              :key="item.id"
              :class="['bdbottom',index===0? 'bdtop':'','vcenter']"
            >
              <!-- 一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="removeRightByid(row,item.id)">{{item.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 二级和三级权限 -->
              <el-col :span="19">
                <el-row
                  v-for="(item2,index2) in item.children"
                  :key="item2.id"
                  :class="[index2===0?'':'bdtop','vcenter']"
                >
                  <el-col :span="6">
                    <el-tag
                      closable
                      @close="removeRightByid(row,item2.id)"
                      type="success"
                    >{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 三级权限 -->
                  <el-col :span="18">
                    <el-tag
                      type="warning"
                      v-for="(item3) in item2.children"
                      :key="item3.id"
                      closable
                      @close="removeRightByid(row,item3.id)"
                    >{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="roleName" label="角色名称"></el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template v-slot="{row}">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="findRole(row)">编辑</el-button>
            <el-button type="danger" size="mini" icon="el-icon-delete">删除</el-button>
            <el-button
              type="warning"
              size="mini"
              icon="el-icon-setting"
              @click="showSetRightDialog(row)"
            >分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 分配权限的对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightdialogVisible"
      width="50%"
      @close="setRightDialogClosed"
    >
      <!-- 树形控件 -->
      <el-tree
        :data="rightList"
        ref="rightRef"
        show-checkbox
        node-key="id"
        :default-expanded-keys="[2, 3]"
        :props="RightsTreeProps"
        default-expand-all
        :default-checked-keys="rightKeys"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightdialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights(roleId)">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 声明角色列表
      rolesList: [],
      // 树形控件树形绑定对象
      RightsTreeProps: {
        children: 'children',
        label: 'authName'
      },
      // 对话框显示与隐藏 默认隐藏
      setRightdialogVisible: false,
      // 所有权限数据
      rightList: [],
      // 默认选中的节点ID值数组
      rightKeys: [],
      // 用来保存点击权限配置时获取的角色id
      roleId: ''
    }
  },
  // 页面打开时就调用获取角色列表方法
  created () {
    this.getRoles()
  },
  methods: {
    // 获取角色列表方法
    async getRoles () {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) return this.$message.error('获取角色列表失败')
      // console.log(res.data)
      this.rolesList = res.data
    },
    // 点击权限标签上的关闭图标 删除权限删除某个角色的某个权限
    async removeRightByid (role, rightId) {
      // 弹出一个确认框来确认是否删除
      const confirmResult = await this.$confirm('此操作将删除该权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') return this.$message.info('取消删除')
      const { data: res } = await this.$http.delete(`/roles/${role.id}/rights/${rightId}`)
      if (res.meta.status !== 200) return this.$message.error('删除失败')
      // 传入的当前角色的所有数据,让当前角色的children属性重新赋值,那么表格中的值也会随之发生变化  这里响应的data数据是返回的最新数据
      role.children = res.data
      // 删除成功这里不能调用获取列表方法,那样做会重新渲染整个页面,用户体验不好
      this.$message.success('成功删除')
    },
    // 点击编辑按钮修改角色名称和角色描述
    findRole (row) {
      this.$router.push({ path: `/editRole/${row.id}` })
    },
    // 展示分配权限的对话框
    async showSetRightDialog (role) {
      // 获取权限列表
      const { data: res } = await this.$http.get('/rights/tree')
      if (res.meta.status !== 200) return this.$message.error('获取权限列表失败')
      // 保存roleId 以提供后面修改权限时用
      this.roleId = role.id
      // 把获取到的数据保存到data中
      this.rightList = res.data
      // 调用获取三级权限的递归方法,来给三级权限ID数组 rightkeys赋值
      this.getrightKeys(role, this.rightKeys)
      // 最后展示
      this.setRightdialogVisible = true
    },
    // 通过递归的形式获取角色下所有三级权限的id,并保存到rightKeys数组中
    getrightKeys (node, arr) {
      // 如果当前node节点没有children属性,则表示当前node节点是第三级节点
      if (!node.children) {
        // 这里return之后forEach才会继续进行,否则会出错
        return arr.push(node.id)
      }
      // 如果node节点有children属性即为数组,那么需要遍历
      node.children.forEach(item => {
        this.getrightKeys(item, arr)
      })
    },
    // 监听分配权限对话框的关闭事件
    setRightDialogClosed () {
      // 关闭对话框后让所有权限数据清零,下次打开权限分配时就可以只显示那个人的权限了
      this.rightKeys = []
    },
    // 点击分配授权的确定按钮调整授权数据
    async allotRights (roleId) {
      // 获取到所有全选和半选属性的id值 重新赋值到新数组中
      // 展开运算符可以拿到一个类数组以,隔开的数组  $refs是对组件的引用 在组件中设置ref属性 即可调用
      const newRightKeys = [...this.$refs.rightRef.getHalfCheckedKeys(), ...this.$refs.rightRef.getCheckedKeys()]
      // 后台接口要求传递一个以逗号隔开的字符串 参数名是rids
      const strRightkeys = newRightKeys.join(',')
      // console.log(strRightkeys)
      const { data: res } = await this.$http.post(`/roles/${roleId}/rights`, { rids: strRightkeys })
      if (res.meta.status !== 200) return this.$message.error('修改权限失败')
      this.$message.success('分配权限操作成功')
      // 操作成功重新渲染页面
      this.getRoles()
      // 分配成功关闭对话框
      this.setRightdialogVisible = false
    }
  }
}
</script>

<style>
.el-tag {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>
