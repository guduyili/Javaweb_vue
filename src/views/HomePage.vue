<template>
  <div class="home-page">
    <el-card class="welcome-card">
      <template #header>
        <div class="clearfix">
          <span>学生选课管理系统</span>
        </div>
      </template>
      
      <div class="welcome-content">
        <div class="welcome-info">
          <h2>欢迎使用学生选课管理系统</h2>
          <p>本系统提供学生、课程和选课信息的管理功能</p>
          
          <div class="stats">
            <div class="stat-item" v-for="(item, index) in stats" :key="index">
              <div class="stat-value">{{ item.value }}</div>
              <div class="stat-label">{{ item.label }}</div>
            </div>
          </div>
          
          <div class="quick-links">
            <!-- <el-button type="primary" @click="navigateTo('StudentList')">
              <el-icon><User /></el-icon>学生管理
            </el-button> -->
            <el-button type="primary" @click="navigateTo('CourseList')">
              <el-icon><Notebook /></el-icon>课程详情
            </el-button>
            <el-button type="primary" @click="navigateTo('EnrollmentList')">
              <el-icon><Document /></el-icon>学生选课
            </el-button>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/api'

export default {
  setup() {
    const router = useRouter()
    const stats = ref([
      { label: '学生总数', value: 7 },
      { label: '课程总数', value: 12 },
      { label: '选课记录', value: 8 }
    ])

    const fetchStats = async () => {
      try {
        const [studentRes, courseRes, enrollmentRes] = await Promise.all([
          api.get('/students/count'),
          api.get('/courses/count'),
          api.get('/enrollments/count')
        ])
        
        stats.value[0].value = studentRes.count || 0
        stats.value[1].value = courseRes.count || 0
        stats.value[2].value = enrollmentRes.count || 0
      } catch (error) {
        console.error('获取统计数据失败:', error)
      }
    }

    const navigateTo = (name) => {
      router.push({ name })
    }

    onMounted(fetchStats)

    return {
      stats,
      navigateTo
    }
  }
}
</script>

<style scoped>
.welcome-card {
  margin: 20px;
}

.welcome-info {
  padding: 20px;
}

.stats {
  display: flex;
  gap: 20px;
  margin: 30px 0;
}

.stat-item {
  flex: 1;
  background-color: #f5f7fa;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
  color: #303133;
}

.stat-label {
  color: #909399;
  margin-top: 10px;
}

.quick-links {
  display: flex;
  gap: 20px;
}
</style>