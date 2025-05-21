// vue.config.js 代理配置示例
module.exports = {
  devServer: {
    proxy: {
      '/sms': {
        target: 'http://localhost:3000',  // 转发到后端
        changeOrigin: true,
        pathRewrite: { '^/sms': '' }  // 移除前缀，实际请求后端 `/students`
      }
    }
  }
}