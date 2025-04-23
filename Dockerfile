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

# 暴露应用运行的端口（根据你的应用实际端口修改）
EXPOSE 3000

# 定义容器启动时运行的命令（根据你的应用启动命令修改）
CMD ["npm", "start"]