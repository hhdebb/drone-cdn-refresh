'use strict';
// This file is auto-generated, don't edit it
// 依赖的模块可通过下载工程中的模块依赖文件或右上角的获取 SDK 依赖信息查看
const Cdn20180510 = require('@alicloud/cdn20180510');
const OpenApi = require('@alicloud/openapi-client');
const Util = require('@alicloud/tea-util');
const Credential = require('@alicloud/credentials');
const Tea = require('@alicloud/tea-typescript');

class Cdn
{
    
    /**
     * 使用凭据初始化账号Client
     * @return Client
     * @throws Exception
     */
    static createClient()
    {
        // 工程代码建议使用更安全的无AK方式，凭据配置方式请参见：https://help.aliyun.com/document_detail/378664.html。
        let credential = new Credential.default();
        let config = new OpenApi.Config({
            credential: credential,
        });
        // Endpoint 请参考 https://api.aliyun.com/product/Cdn
        config.endpoint = `cdn.aliyuncs.com`;
        return new Cdn20180510.default(config);
    }
    
    static async main(args)
    {
        let client = Client.createClient();
        let refreshObjectCachesRequest = new Cdn20180510.RefreshObjectCachesRequest({
            force: true,
            objectType: 'Directory',
            objectPath: '',
        });
        let runtime = new Util.RuntimeOptions({});
        try
        {
            // 复制代码运行请自行打印 API 的返回值
            await client.refreshObjectCachesWithOptions(refreshObjectCachesRequest, runtime);
        }
        catch ( error )
        {
            // 此处仅做打印展示，请谨慎对待异常处理，在工程项目中切勿直接忽略异常。
            // 错误 message
            console.log(error.message);
            // 诊断地址
            console.log(error.data["Recommend"]);
            Util.default.assertAsString(error.message);
        }
    }
    
}

exports.Cdn = Cdn;
Cdn.main(process.argv.slice(2)).then(result => {
    console.log(result);
});