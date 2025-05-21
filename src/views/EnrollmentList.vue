<template>
  <div class="enrollment-list">
    <el-card class="box-card">
      <template #header>
        <div class="clearfix">
          <span>选课列表</span>
          <el-button 
            style="float: right; padding: 3px 0" 
            type="primary" 
            @click="openAddDialog"
          >
            <el-icon><Plus /></el-icon>新增选课
          </el-button>
        </div>
      </template>

      <!-- 查询表单 -->
      <el-form :inline="true" :model="filterForm" class="demo-form-inline">
        <el-form-item label="教师">
          <el-input v-model="filterForm.teacherId" placeholder="请输入教师编号" />
        </el-form-item>
        <el-form-item label="学生">
          <el-input v-model="filterForm.studentId" placeholder="请输入学号" />
        </el-form-item>
        <el-form-item label="课程">
          <el-input v-model="filterForm.courseId" placeholder="请输入课程编号" />
        </el-form-item>
        <el-form-item label="学年">
          <el-input v-model.number="filterForm.year" placeholder="请输入学年" />
        </el-form-item>
        <el-form-item label="学期">
          <el-select v-model="filterForm.term" placeholder="请选择学期">
            <el-option label="第一学期" value="1" />
            <el-option label="第二学期" value="2" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchEnrollments">查询</el-button>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 数据表格 -->
      <el-table :data="enrollments" stripe border style="width: 100%">
        <el-table-column type="index" width="50" />
        <el-table-column prop="enrollmentId" label="选课ID" width="200" />
        <el-table-column prop="studentId" label="学号" width="120" />
        <el-table-column prop="courseId" label="课程编号" width="120" />
        <el-table-column prop="teacherId" label="教师编号" width="100" />
        <el-table-column prop="year" label="学年" width="100" />
        <el-table-column prop="term" label="学期" width="80">
          <template #default="scope">
            {{ scope.row.term === 1 ? '第一学期' : '第二学期' }}
          </template>
        </el-table-column>
        <el-table-column prop="score" label="成绩" width="80">
          <template #default="scope">
            {{ scope.row.score || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'finished' ? 'success' : 'warning'">
              {{ scope.row.status === 'finished' ? '已完成' : '进行中' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button 
              size="small" 
              type="primary" 
              @click="editEnrollment(scope.row)"
            >
              <el-icon><Edit /></el-icon>编辑
            </el-button>
            <el-button 
              size="small" 
              type="danger" 
              @click="deleteEnrollment(scope.row.enrollmentId)"
            >
              <el-icon><Delete /></el-icon>删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页组件 -->
      <el-pagination
        style="margin-top: 20px"
        background
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        :page-sizes="[10, 20, 30, 50]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      />
    </el-card>

    <!-- 对话框 -->
    <el-dialog v-model="dialogVisible" title="选课信息">
      <el-form 
        :model="enrollmentForm" 
        ref="formRef" 
        label-width="120px"
      >
        <el-input type="hidden" v-model="enrollmentForm.enrollmentId" />

        <!-- 学生选择 -->
        <el-form-item label="学号" prop="studentId">
          <el-select 
            v-model="enrollmentForm.studentId" 
            placeholder="请输入姓名及学号" 
            clearable
            :disabled="!!enrollmentForm.enrollmentId"
          >
            <el-option
              v-for="student in students"
              :key="student.studentId"
              :label="student.name + ' (' + student.studentId + ')'"
              :value="student.studentId"
            />
          </el-select>
        </el-form-item>

        <!-- 课程选择 -->
        <el-form-item label="课程" prop="courseId">
          <el-select 
            v-model="enrollmentForm.courseId" 
            placeholder="请选择课程" 
            clearable
            :disabled="!!enrollmentForm.enrollmentId"
          >
            <el-option
              v-for="course in courses"
              :key="course.courseId"
              :label="course.courseName + ' (' + course.courseId + ')'"
              :value="course.courseId"
            />
          </el-select>
        </el-form-item>

        <!-- 教师编号 -->
        <el-form-item label="教师编号" prop="teacherId">
          <el-input 
            v-model="enrollmentForm.teacherId" 
            placeholder="教师编号" 
            readonly 
          />
        </el-form-item>

        <!-- 学年 -->
        <el-form-item label="学年" prop="year">
          <el-input v-model.number="enrollmentForm.year" placeholder="请输入学年" />
        </el-form-item>

        <!-- 学期 -->
        <el-form-item label="学期" prop="term">
          <el-select v-model="enrollmentForm.term" placeholder="请选择学期">
            <el-option label="第一学期" value="1" />
            <el-option label="第二学期" value="2" />
          </el-select>
        </el-form-item>

        <!-- 成绩输入 -->
        <el-form-item label="成绩" prop="score">
          <el-input 
            v-model.number="enrollmentForm.score" 
            placeholder="请输入成绩（0-100）"
            :disabled="!enrollmentForm.enrollmentId" 
          />
        </el-form-item>

        <!-- 状态选择 -->
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="enrollmentForm.status">
            <el-radio :label="'finished'">已完成</el-radio>
            <el-radio :label="'ongoing'">进行中</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <!-- 对话框底部按钮 -->
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import api from '@/api'

export default {
  setup() {
    // 响应式数据
    const enrollments = ref([])
    const students = ref([])
    const courses = ref([])
    const dialogVisible = ref(false)
    const formRef = ref(null)
    const currentPage = ref(1)
    const pageSize = ref(10)
    const total = ref(0)

    const filterForm = reactive({
      studentId: '',
      courseId: '',
      teacherId: '',
      year: '',
      term: ''
    })

    const enrollmentForm = reactive({
      enrollmentId: null,
      studentId: '',
      courseId: '',
      teacherId: '',
      year: new Date().getFullYear(),
      term: 1,
      score: null,
      status: 'ongoing'
    })

    // 数据获取
    const fetchEnrollments = async () => {
      try {
        const params = {
          page: currentPage.value,
          size: pageSize.value,
          ...filterForm
        }
        const res = await api.get('/enrollments', { params })
        enrollments.value = res.data || []
        total.value = res.data.length || 0
      } catch (error) {
        ElMessage.error('获取选课列表失败')
        console.error('获取选课列表错误:', error)
      }
    }

    const fetchStudents = async () => {
      try {
        const res = await api.get('/students')
        students.value = res.data || []
      } catch (error) {
        console.error('获取学生列表错误:', error)
      }
    }

    const fetchCourses = async () => {
      try {
        const res = await api.get('/courses')
        courses.value = res.data || []
      } catch (error) {
        console.error('获取课程列表错误:', error)
      }
    }

    // 表单操作
    const openAddDialog = () => {
      enrollmentForm.enrollmentId = null
      enrollmentForm.studentId = ''
      enrollmentForm.courseId = ''
      enrollmentForm.teacherId = ''
      enrollmentForm.year = new Date().getFullYear()
      enrollmentForm.term = 1
      enrollmentForm.score = null
      enrollmentForm.status = 'ongoing'
      dialogVisible.value = true
      formRef.value?.resetFields()
    }

    const editEnrollment = (enrollment) => {
      Object.assign(enrollmentForm, enrollment)
      dialogVisible.value = true
    }

    const deleteEnrollment = async (enrollmentId) => {
      try {
        await ElMessageBox.confirm(
          '确定要删除该选课记录吗？',
          '提示',
          { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
        )
        await api.delete(`/enrollments/${enrollmentId}`)
        ElMessage.success('删除成功')
        fetchEnrollments()
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('删除失败')
          console.error('删除选课记录错误:', error)
        }
      }
    }

    const submitForm = async () => {
      try {
        if (!enrollmentForm.studentId || !enrollmentForm.courseId) {
          ElMessage.warning('学生和课程不能为空')
          return
        }

        // 构造请求数据
        const formData = {
          studentId: enrollmentForm.studentId,
          courseId: enrollmentForm.courseId,
          teacherId: enrollmentForm.teacherId,
          year: enrollmentForm.year,
          term: enrollmentForm.term,
          status: enrollmentForm.status
        }

        // 仅在编辑时包含 score 字段
        if (enrollmentForm.enrollmentId) {
          formData.score = enrollmentForm.score
        }

        if (enrollmentForm.enrollmentId) {
          await api.put(`/enrollments/${enrollmentForm.enrollmentId}`, formData)
          ElMessage.success('更新成功')
        } else {
          await api.post('/enrollments', formData)
          ElMessage.success('添加成功')
        }

        dialogVisible.value = false
        fetchEnrollments()
      } catch (error) {
        ElMessage.error(enrollmentForm.enrollmentId ? '更新失败' : '添加失败')
        console.error('提交表单错误:', error)
      }
    }

    // 查询重置
    const resetFilter = () => {
      filterForm.studentId = ''
      filterForm.courseId = ''
      filterForm.teacherId = ''
      filterForm.year = ''
      filterForm.term = ''
      fetchEnrollments()
    }

    // 分页处理
    const handleSizeChange = (newSize) => {
      pageSize.value = newSize
      fetchEnrollments()
    }

    const handleCurrentChange = (newPage) => {
      currentPage.value = newPage
      fetchEnrollments()
    }

    // 初始化
    onMounted(() => {
      fetchEnrollments()
      fetchStudents()
      fetchCourses()
    })

    return {
      enrollments,
      students,
      courses,
      dialogVisible,
      formRef,
      currentPage,
      pageSize,
      total,
      filterForm,
      enrollmentForm,
      fetchEnrollments,
      fetchStudents,
      fetchCourses,
      openAddDialog,
      editEnrollment,
      deleteEnrollment,
      submitForm,
      resetFilter,
      handleSizeChange,
      handleCurrentChange
    }
  }
}
</script>

<style scoped>
.box-card {
  margin: 20px;
}
.demo-form-inline {
  margin-bottom: 20px;
}
</style>