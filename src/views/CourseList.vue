<template>
  <div class="course-list">
    <el-card class="box-card">
      <template #header>
        <div class="clearfix">
          <span>课程列表</span>
          <el-button style="float: right; padding: 3px 0" type="primary" @click="openAddDialog">
            <el-icon><Plus /></el-icon>添加课程
          </el-button>
        </div>
      </template>
      
      <el-table :data="courses" stripe border style="width: 100%">
        <el-table-column prop="courseId" label="课程编号" width="120" />
        <el-table-column prop="courseName" label="课程名称" width="150" />
        <el-table-column prop="department" label="所属院系" width="150" />
        <el-table-column prop="credit" label="学分" width="80" />
        <el-table-column prop="period" label="课时" width="80" />
        <el-table-column prop="courseType" label="课程类型" width="100" />
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button size="small" type="primary" @click="editCourse(scope.row)">
              <el-icon><Edit /></el-icon>编辑
            </el-button>
            <el-button size="small" type="danger" @click="deleteCourse(scope.row)">
              <el-icon><Delete /></el-icon>删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
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
    
    <el-dialog v-model:visible="dialogVisible" title="课程信息">
      <el-form :model="courseForm" ref="formRef" label-width="120px">
        <el-form-item label="课程编号" prop="courseId">
          <el-input v-model="courseForm.courseId" placeholder="请输入课程编号" />
        </el-form-item>
        <el-form-item label="课程名称" prop="courseName">
          <el-input v-model="courseForm.courseName" placeholder="请输入课程名称" />
        </el-form-item>
        <el-form-item label="所属院系" prop="department">
          <el-input v-model="courseForm.department" placeholder="请输入所属院系" />
        </el-form-item>
        <el-form-item label="学分" prop="credit">
          <el-input-number v-model.number="courseForm.credit" min="1" max="5" />
        </el-form-item>
        <el-form-item label="课时" prop="period">
          <el-input-number v-model.number="courseForm.period" min="16" max="96" step="8" />
        </el-form-item>
        <el-form-item label="课程类型" prop="courseType">
          <el-radio-group v-model="courseForm.courseType">
            <el-radio label="必修">必修</el-radio>
            <el-radio label="选修">选修</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import api from '@/api'

export default {
  setup() {
    const courses = ref([])
    const dialogVisible = ref(false)
    const formRef = ref(null)
    const currentPage = ref(1)
    const pageSize = ref(10)
    const total = ref(0)
    
    const courseForm = reactive({
      courseId: '',
      courseName: '',
      department: '',
      credit: 3,
      period: 48,
      courseType: '必修'
    })

    const fetchCourses = async () => {
      try {
        const res = await api.get(`/courses?page=${currentPage.value}&size=${pageSize.value}`)
        // 根据后端返回结构调整
        courses.value = res.data || []
        total.value = res.data.length || 0
      } catch (error) {
        ElMessage.error('获取课程列表失败')
        console.error('获取课程列表错误:', error)
      }
    }

    const openAddDialog = () => {
      // 重置表单数据
      courseForm.courseId = ''
      courseForm.courseName = ''
      courseForm.department = ''
      courseForm.credit = 3
      courseForm.period = 48
      courseForm.courseType = '必修'
      
      dialogVisible.value = true
      nextTick(() => {
        formRef.value?.resetFields()
      })
    }

    const editCourse = (course) => {
      // 复制课程数据到表单
      Object.assign(courseForm, course)
      dialogVisible.value = true
    }

    const deleteCourse = async (course) => {
      try {
        await ElMessageBox.confirm(
          `确定要删除课程 ${course.courseName} (${course.courseId}) 吗？`,
          '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )
        
        await api.delete(`/courses/${course.courseId}`)
        ElMessage.success('删除成功')
        fetchCourses()
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('删除失败')
          console.error('删除课程错误:', error)
        }
      }
    }

    const submitForm = async () => {
      try {
        // 表单验证（添加课时和课程类型验证）
        if (!courseForm.courseId || !courseForm.courseName || !courseForm.period || !courseForm.courseType) {
          ElMessage.warning('课程编号、名称、课时和课程类型不能为空')
          return
        }
        
        const formData = {
          ...courseForm
        }

        if (courseForm.courseId) {
          // 更新课程信息
          await api.put(`/courses/${courseForm.courseId}`, formData)
          ElMessage.success('更新成功')
        } else {
          // 添加新课程
          await api.post('/courses', formData)
          ElMessage.success('添加成功')
        }
        
        dialogVisible.value = false
        fetchCourses()
      } catch (error) {
        ElMessage.error(courseForm.courseId ? '更新失败' : '添加失败')
        console.error('提交表单错误:', error)
      }
    }

    const handleSizeChange = (newSize) => {
      pageSize.value = newSize
      fetchCourses()
    }

    const handleCurrentChange = (newPage) => {
      currentPage.value = newPage
      fetchCourses()
    }

    onMounted(fetchCourses)

    return {
      courses,
      dialogVisible,
      formRef,
      currentPage,
      pageSize,
      total,
      courseForm,
      fetchCourses,
      openAddDialog,
      editCourse,
      deleteCourse,
      submitForm,
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
</style>