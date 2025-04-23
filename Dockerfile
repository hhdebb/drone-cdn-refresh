# 使用官方 Node.js 18 镜像作为基础镜像
FROM node:18-alpine

# 设置工作目录
WORKDIR /usr/src/app

# 将 package.json 和 package-lock.json 复制到工作目录
COPY package*.json ./

# 安装依赖
RUN npm install

# 将项目文件复制到工作目录
COPY . .

# 环境变量配置说明
# cdnResourceTagName - 标签名称，多个标签用|分隔
# REFRESH_TYPE - 刷新类型 (File/Directory)，默认为Directory
# API_URL - API接口地址

# 启动命令
CMD ["npm", "start"]