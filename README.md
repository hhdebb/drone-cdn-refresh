# 阿里云CDN/DCDN缓存刷新工具

这是一个用于刷新阿里云CDN和DCDN缓存的工具，作为Docker镜像运行在Drone CI/CD流程中。

## 功能

- 支持阿里云CDN缓存刷新
- 支持阿里云DCDN缓存刷新
- 通过环境变量控制行为
- 自动刷新CDN和DCDN缓存
- 支持通过标签名称获取需要刷新的域名和凭证配置

## 环境变量配置

| 环境变量 | 说明 | 必填 | 示例 |
|---------|------|-----|------|
| cdnResourceTagName | 标签名称，多个标签用\|分隔 | 是 | vant_demo\|vue_test3 |
| REFRESH_TYPE | 刷新类型 | 否，默认Directory | File 或 Directory |
| API_URL | API接口地址 | 否，有默认值 | https://api.example.com/cdn-dcdn-config |

## 本地开发

1. 复制示例环境变量文件并根据需要修改
```bash
cp .env.example .env
```

2. 修改.env文件中的配置
```
# 配置标签名称,多个使用竖线分割
cdnResourceTagName=vant_demo|vue_test3

# 刷新类型(File/Directory)
REFRESH_TYPE=Directory

# API地址
API_URL=https://api.example.com/cdn-dcdn-config
```

3. 安装依赖并运行
```bash
npm install
npm start
```

## 工作流程

1. 从环境变量获取标签名称(cdnResourceTagName)
2. 请求外部API接口获取对应标签的CDN和DCDN配置
3. 根据配置信息，分别调用阿里云CDN和DCDN API进行缓存刷新
4. 返回刷新结果统计

## 项目结构

```
.
├── src/
│   ├── index.js         # 主入口文件，根据环境变量调用相应功能
│   ├── cdn.js           # CDN刷新模块
│   ├── dcdn.js          # DCDN刷新模块
│   └── utils/
│       └── logger.js    # 日志工具
├── .env                 # 环境变量文件（本地开发用）
├── .env.example         # 环境变量示例文件
├── package.json
├── Dockerfile
└── README.md
```

## 使用Docker镜像

```bash
docker run \
  -e cdnTagName=vant_demo \
  -e REFRESH_TYPE=Directory \
  -e API_URL=https://api.example.com/cdn-dcdn-config \
  your-docker-username/drone-cdn-refresh
```

## 在Drone CI中使用

```yaml
steps:
  - name: refresh-cdn
    image: your-docker-username/drone-cdn-refresh
    environment:
      cdnTagName: vant_demo|vue_test3
      REFRESH_TYPE: Directory
      API_URL: https://api.example.com/cdn-dcdn-config
```

## 接口返回数据示例

```json
{
  "code": 1,
  "msg": "请求成功",
  "time": "1745410300",
  "data": {
    "cdn": {
      "sms": [
        {
          "access": {
            "accessKeyId": "***",
            "accessKeySecret": "***"
          },
          "domains": [
            "https://test1.example.com/",
            "https://test2.example.com/"
          ]
        }
      ]
    },
    "dcdn": {
      "ytd": [
        {
          "access": {
            "accessKeyId": "***",
            "accessKeySecret": "***",
          },
          "domains": [
            "https://test1.test.com/",
            "https://test2.test.com/"
          ]
        }
      ]
    }
  }
}
``` 