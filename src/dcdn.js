'use strict';
// 依赖的模块可通过下载工程中的模块依赖文件或右上角的获取 SDK 依赖信息查看
const dcdn20180115 = require('@alicloud/dcdn20180115');
const OpenApi = require('@alicloud/openapi-client');
const Util = require('@alicloud/tea-util');
const Credential = require('@alicloud/credentials');
const Tea = require('@alicloud/tea-typescript');
const { log } = require('./utils/logger');

class Dcdn
{
    
    /**
     * 使用凭据初始化账号Client
     * @param {string} accessKeyId - 阿里云访问密钥ID
     * @param {string} accessKeySecret - 阿里云访问密钥Secret
     * @return Client
     * @throws Exception
     */
    static createClient(accessKeyId, accessKeySecret)
    {
        if (!accessKeyId || !accessKeySecret)
        {
            throw new Error('缺少阿里云AK配置');
        }
        
        // 创建凭证
        let credential = new Credential.default({
            type: 'access_key',
            accessKeyId: accessKeyId,
            accessKeySecret: accessKeySecret
        });
        
        let config = new OpenApi.Config({
            credential: credential,
        });
        // Endpoint 请参考 https://api.aliyun.com/product/dcdn
        config.endpoint = `dcdn.aliyuncs.com`;
        return new dcdn20180115.default(config);
    }
    
    /**
     * 刷新DCDN缓存
     * @param {string} accessKeyId - 阿里云访问密钥ID
     * @param {string} accessKeySecret - 阿里云访问密钥Secret
     * @param {string} objectPath - 要刷新的对象路径
     * @param {string} objectType - 对象类型，可以是'File'或'Directory'
     * @return {Promise<Object>} - 刷新结果
     */
    static async refresh(accessKeyId, accessKeySecret, objectPath, objectType = 'Directory')
    {
        if (!objectPath)
        {
            throw new Error('请提供要刷新的对象路径');
        }
        
        let client = Dcdn.createClient(accessKeyId, accessKeySecret);
        let refreshDcdnObjectCachesRequest = new dcdn20180115.RefreshDcdnObjectCachesRequest({
            objectType: objectType,
            objectPath: objectPath,
            force: true
        });
        let runtime = new Util.RuntimeOptions({});
        try 
        {
            // 发送刷新请求并返回结果
            const result = await client.refreshDcdnObjectCachesWithOptions(refreshDcdnObjectCachesRequest, runtime);
            return result.body;
        } 
        catch (error) 
        {
            // 错误处理
            log(`DCDN刷新错误: ${error.message}`, true);
            if (error.data && error.data["Recommend"])
            {
                log(`诊断信息: ${error.data["Recommend"]}`, true);
            }
            throw error;
        }
    }
    
}

// 只导出Dcdn类，不包含单独执行代码
module.exports = { Dcdn };