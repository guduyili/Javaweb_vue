<template>
  <div class="student-list">
    <el-card class="box-card">
      <template #header>
        <div class="clearfix">
          <span>学生列表</span>
          <el-button style="float: right; padding: 3px 0" type="primary" @click="openAddDialog">
            <el-icon><Plus /></el-icon>添加学生
          </el-button>
        </div>
      </template>
      
      <el-table :data="students" stripe border style="width: 100%">
        <el-table-column prop="studentId" label="学号" width="120" />
        <el-table-column prop="name" label="姓名" width="100" />
        <el-table-column prop="gender" label="性别" width="80">
          <template #default="scope">
            {{ scope.row.gender }}
          </template>
        </el-table-column>
        <el-table-column prop="department" label="院系" width="150" />
        <el-table-column prop="major" label="专业" width="150" />
        <el-table-column prop="grade" label="年级" width="100" />
        <el-table-column prop="phone" label="电话" width="180" />
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button size="small" type="primary" @click="editStudent(scope.row)">
              <el-icon><Edit /></el-icon>编辑
            </el-button>
            <el-button size="small" type="danger" @click="deleteStudent(scope.row)">
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
    
    <el-dialog v-model="dialogVisible" title="学生信息">
      <el-form :model="studentForm" ref="formRef" label-width="120px">
        <el-form-item label="学号" prop="studentId">
          <el-input v-model="studentForm.studentId" placeholder="请输入学号" />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="studentForm.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-radio-group v-model="studentForm.gender">
            <el-radio :label="'男'">男</el-radio>
            <el-radio :label="'女'">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="院系" prop="department">
          <el-input v-model="studentForm.department" placeholder="请输入院系" />
        </el-form-item>
        <el-form-item label="专业" prop="major">
          <el-input v-model="studentForm.major" placeholder="请输入专业" />
        </el-form-item>
        <el-form-item label="年级" prop="grade">
          <el-input v-model="studentForm.grade" placeholder="请输入年级" />
        </el-form-item>
        <el-form-item label="电话" prop="phone">
          <el-input v-model="studentForm.phone" placeholder="请输入电话" />
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
    const students = ref([])
    const dialogVisible = ref(false)
    const formRef = ref(null)
    const currentPage = ref(1)
    const pageSize = ref(10)
    const total = ref(0)
    
    const studentForm = reactive({
      studentId: '',
      name: '',
      gender: '男',
      department: '',
      major: '',
      grade: '',
      phone: ''
    })

    // 获取学生列表
    const fetchStudents = async () => {
      try {
        const res = await api.get(`/students?page=${currentPage.value}&size=${pageSize.value}`)
        students.value = res.data || []
        total.value = res.data.length || 0
      } catch (error) {
        ElMessage.error('获取学生列表失败')
        console.error('获取学生列表错误:', error)
      }
    }

    const openAddDialog = () => {
      studentForm.studentId = ''
      studentForm.name = ''
      studentForm.gender = '男'
      studentForm.department = ''
      studentForm.major = ''
      studentForm.grade = ''
      studentForm.phone = ''
      
      dialogVisible.value = true
      nextTick(() => {
        formRef.value?.resetFields()
      })
    }

    const editStudent = (student) => {
      studentForm.studentId = student.studentId
      studentForm.name = student.name
      studentForm.department = student.department
      studentForm.major = student.major
      studentForm.grade = student.grade
      studentForm.gender = student.gender
      studentForm.phone = student.phone
      
      dialogVisible.value = true
    }

    // 删除学生
    const deleteStudent = async (student) => {
      try {
        await ElMessageBox.confirm(
          `确定要删除学生 ${student.name} (${student.studentId}) 吗？`,
          '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )
        
        await api.delete(`/students/${student.studentId}`)
        ElMessage.success('删除成功')
        fetchStudents()
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('删除失败')
          console.error('删除学生错误:', error)
        }
      }
    }

    // 提交表单
    const submitForm = async () => {
      try {
        if (!studentForm.studentId || !studentForm.name || !studentForm.grade || !studentForm.phone) {
          ElMessage.warning('学号、姓名、年级、电话不能为空')
          return
        }
        
        const formData = {
          ...studentForm
        }

        if (studentForm.studentId) {
          // 更新学生
          await api.put(`/students/${studentForm.studentId}`, formData)
          ElMessage.success('更新成功')
        } else {
          // 添加学生
          await api.post('/students', formData)
          console.log(formData)
          ElMessage.success('添加成功')
        }
        
        dialogVisible.value = false
        fetchStudents()
      } catch (error) {
        ElMessage.error(studentForm.studentId ? '更新失败' : '添加失败')
        console.error('提交表单错误:', error)
      }
    }

    const handleSizeChange = (newSize) => {
      pageSize.value = newSize
      fetchStudents()
    }

    const handleCurrentChange = (newPage) => {
      currentPage.value = newPage
      fetchStudents()
    }

    onMounted(fetchStudents)

    return {
      students,
      dialogVisible,
      formRef,
      currentPage,
      pageSize,
      total,
      studentForm,
      fetchStudents,
      openAddDialog,
      editStudent,
      deleteStudent,
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