<template>
  <el-container>
    <el-aside width="200px">
      <div class="logo">
        <h1>学生选课系统</h1>
      </div>
      <el-menu
        :default-active="activeMenu"
        class="el-menu-vertical"
        router
      >
        <el-menu-item index="/">
          <el-icon><House /></el-icon>
          <span>首页</span>
        </el-menu-item>
        <!-- <el-menu-item index="/students">
          <el-icon><User /></el-icon>
          <span>学生管理</span>
        </el-menu-item> -->
        <el-menu-item index="/courses">
          <el-icon><Notebook /></el-icon>
          <span>课程详情</span>
        </el-menu-item>
        <el-menu-item index="/enrollments">
          <el-icon><Document /></el-icon>
          <span>学生选课</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    
    <el-container>
      <el-header>
        <div class="header-content">
          <div class="header-title">
            <h2>{{ pageTitle }}</h2>
          </div>
          <div class="header-user">
            <el-dropdown @command="handleCommand">
              <span class="el-dropdown-link">
                <el-icon><Avatar /></el-icon>
                用户 <el-icon><CaretBottom /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="logout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </el-header>
      
      <el-main>
        <router-view @update:pageTitle="updatePageTitle" />
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'

export default {
  setup() {
    const route = useRoute()
    const activeMenu = computed(() => route.path)
    const pageTitle = ref('首页')

    const updatePageTitle = (title) => {
      pageTitle.value = title
    }

    const handleCommand = (command) => {
      if (command === 'logout') {
        alert('退出登录')
      }
    }

    onMounted(() => {
      pageTitle.value = route.meta.title || '首页'
    })

    return {
      activeMenu,
      pageTitle,
      updatePageTitle,
      handleCommand
    }
  }
}
</script>

<style scoped>
.logo {
  padding: 20px;
  text-align: center;
  border-bottom: 1px solid #e6e6e6;
}

.logo h1 {
  font-size: 18px;
  color: #303133;
  margin: 0;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  padding: 0 20px;
}

.header-title h2 {
  margin: 0;
  color: #303133;
}

.header-user {
  cursor: pointer;
}
</style>