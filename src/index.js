"use strict";

// 加载.env文件中的环境变量
require("dotenv").config();

const { Cdn } = require("./cdn");
const { Dcdn } = require("./dcdn");
const axios = require("axios");
const { log } = require("./utils/logger");

class RefreshManager {
  /**
   * 根据标签名称请求外部接口获取CDN和DCDN配置
   * @param {string} tagName - 标签名称
   * @returns {Promise<Object>} - 外部接口返回的配置数据
   */
  static async fetchConfigByTag(tagName) {
    try {
      // 从环境变量获取API接口地址
      const apiUrl =
        process.env.API_URL || "https://api.example.com/cdn-dcdn-config";

      log(`正在请求配置数据: ${tagName}`);
      
      // 发送请求获取配置数据
      const response = await axios.get(apiUrl, {
        params: { tag_name: tagName },
      });
      
      // 检查接口返回状态
      if (response.data && response.data.code === 1) {
        return response.data.data;
      } else {
        throw new Error(`接口请求失败: ${response.data?.msg || "未知错误"}`);
      }
    } catch (error) {
      log(`获取配置数据失败: ${error.message}`, true);
      throw error;
    }
  }

  /**
   * 刷新CDN缓存
   * @param {string} accessKeyId - 阿里云访问密钥ID
   * @param {string} accessKeySecret - 阿里云访问密钥Secret
   * @param {string} objectPath - 要刷新的对象路径，多个路径使用\n分隔
   * @param {string} objectType - 对象类型，可以是'File'或'Directory'
   */
  static async refreshCdn(
    accessKeyId,
    accessKeySecret,
    objectPath,
    objectType = "Directory"
  ) {
    if (!objectPath) {
      throw new Error("刷新路径不能为空");
    }

    try {
      const cdnResult = await Cdn.refresh(
        accessKeyId,
        accessKeySecret,
        objectPath,
        objectType
      );
      return cdnResult;
    } catch (error) {
      log(`内容分发刷新失败: ${error.message}`, true);
      throw error;
    }
  }

  /**
   * 刷新DCDN缓存
   * @param {string} accessKeyId - 阿里云访问密钥ID
   * @param {string} accessKeySecret - 阿里云访问密钥Secret
   * @param {string} objectPath - 要刷新的对象路径，多个路径使用\n分隔
   * @param {string} objectType - 对象类型，可以是'File'或'Directory'
   */
  static async refreshDcdn(
    accessKeyId,
    accessKeySecret,
    objectPath,
    objectType = "Directory"
  ) {
    if (!objectPath) {
      throw new Error("刷新路径不能为空");
    }

    try {
      const dcdnResult = await Dcdn.refresh(
        accessKeyId,
        accessKeySecret,
        objectPath,
        objectType
      );
      return dcdnResult;
    } 
    catch (error) 
    {
      log(`全站加速刷新失败: ${error.message}`, true);
      throw error;
    }
  }

  /**
   * 处理单个标签的刷新
   * @param {string} tagName - 标签名称
   * @param {string} objectType - 刷新类型
   * @returns {Promise<Object>} - 刷新结果
   */
  static async processTagRefresh(tagName, objectType) {
    log(`开始处理刷新标签: ${tagName}, 刷新类型: ${objectType}`);
    
    // 请求外部接口获取配置数据
    const configData = await RefreshManager.fetchConfigByTag(tagName);
    
    if (!configData) {
      throw new Error("获取配置数据失败");
    }
    
    const results = {
      cdn: [],
      dcdn: [],
    };
    
    // 处理CDN配置 - 直接处理而不经过processCdnGroup
    if (configData.cdn) {
      for (const [groupName, configItems] of Object.entries(configData.cdn)) {
        // 配置项始终只有一项
        const configItem = Array.isArray(configItems)? configItems[0]: configItems;
        const { access, domains } = configItem;

        log(`处理内容分发刷新: ${groupName}`);
        console.log(domains);
        
        try {
          // 将所有域名合并为一个请求，用\n分隔
          const combinedDomains = domains.join("\n");
          
          const result = await RefreshManager.refreshCdn(
            access.accessKeyId,
            access.accessKeySecret,
            combinedDomains,
            objectType
          );
          
          results.cdn.push({
            group: groupName,
            domains: domains,
            type: "cdn",
            success: true,
            result,
          });
        }
        catch (error) 
        {
          results.cdn.push({
            group: groupName,
            domains: domains,
            type: "cdn",
            success: false,
            error: error.message,
          });
        }
      }
    }
    
    // 处理DCDN配置 - 直接处理而不经过processDcdnGroup
    if (configData.dcdn) 
    {
      for (const [groupName, configItems] of Object.entries(configData.dcdn)) 
      {
        // 配置项始终只有一项
        const configItem = Array.isArray(configItems)
          ? configItems[0]
          : configItems;

        const { access, domains } = configItem;
        
        log(`处理全站加速刷新: ${groupName}`);
        console.log(domains);
        
        try {
          // 将所有域名合并为一个请求，用\n分隔
          const combinedDomains = domains.join("\n");
          
          const result = await RefreshManager.refreshDcdn(
            access.accessKeyId,
            access.accessKeySecret,
            combinedDomains,
            objectType
          );

          log("全站加速刷新成功");
          console.log(result);
          
          results.dcdn.push({
            group: groupName,
            domains: domains,
            type: "dcdn",
            success: true,
            result,
          });
        } 
        catch (error) 
        {
          results.dcdn.push({
            group: groupName,
            domains: domains,
            type: "dcdn",
            success: false,
            error: error.message,
          });
        }
      }
    }
    
    return results;
  }

  /**
   * 主函数，根据环境变量决定刷新行为
   */
  static async main() {
    try {
      // 从环境变量获取配置
      const tagNamesString = process.env.CDN_RESOURCE_TAG_NAME;
      const objectType = process.env.REFRESH_TYPE || "Directory";
      
      if (!tagNamesString) {
        throw new Error("标签名称不能为空");
      }
      
      // 分割标签字符串，处理多个标签
      const tagNames = tagNamesString
        .split("|")
        .map((tag) => tag.trim())
        .filter((tag) => tag);
      
      if (tagNames.length === 0) {
        throw new Error("标签名称格式错误");
      }

      log(`等待处理刷新标签: ${tagNamesString}`);
      
      // 存储所有标签的处理结果
      const allResults = {
        cdnItems: [], // 所有标签的CDN处理结果
        dcdnItems: [], // 所有标签的DCDN处理结果
      };
      
      // 依次处理每个标签
      for (const tagName of tagNames) {
        log(`开始处理刷新标签: ${tagName}`);
        
        try {
          const tagResult = await RefreshManager.processTagRefresh(
            tagName,
            objectType
          );
          
          // 收集标签处理结果
          allResults.cdnItems.push(...tagResult.cdn);
          allResults.dcdnItems.push(...tagResult.dcdn);
        } catch (error) {
          log(`标签 ${tagName} 处理失败: ${error.message}`, true);
        }
      }
      
      // 输出所有标签的处理汇总
      log("所有刷新操作完成");
      
      return allResults;
    } catch (error) {
      log(`刷新操作失败: ${error.message}`, true);
      process.exit(1);
    }
  }
}

// 如果直接运行此文件
if (require.main === module) {
  RefreshManager.main()
    .then(() => {
      log(`执行完成`);
    })
    .catch((err) => {
      log(`执行出错: ${err.message}`, true);
      process.exit(1);
    });
}

module.exports = RefreshManager;
