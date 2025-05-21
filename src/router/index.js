import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../views/HomePage.vue'
import StudentList from '../views/StudentList.vue'
import CourseList from '../views/CourseList.vue'
import EnrollmentList from '../views/EnrollmentList.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomePage
  },
  {
    path: '/students',
    name: 'StudentList',
    component: StudentList
  },
  {
    path: '/courses',
    name: 'CourseList',
    component: CourseList
  },
  {
    path: '/enrollments',
    name: 'EnrollmentList',
    component: EnrollmentList
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router