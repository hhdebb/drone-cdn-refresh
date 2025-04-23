"use strict";

/**
 * 获取当前时间的格式化字符串
 * @returns {string} 格式为YYYY-MM-DD HH:MM:SS的时间字符串
 */
function getFormattedTime() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * 输出日志，附带时间前缀
 * @param {string} message - 日志消息
 * @param {boolean} isError - 是否为错误日志
 */
function log(message, isError = false) 
{
  const timePrefix = `[${getFormattedTime()}]`;
  if (isError) {
    console.error(`${timePrefix} ${message}`);
  } 
  else 
  {
    console.log(`${timePrefix} ${message}`);
  }
}

module.exports = {
  log,
};
