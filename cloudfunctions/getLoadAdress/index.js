// 云函数模板
// 部署：在 cloud-functions/login 文件夹右击选择 “上传并部署”

const cloud = require('wx-server-sdk')
const axios=require("axios")
// 初始化 cloud
cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
})
const headers = {
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36',
  'sec-fetch-mode': 'cors',
  'sec-fetch-site': 'same-origin',
  'accept': 'application/json',
  "content-type": "application/octet-stream",
  'accept-encoding': 'gzip, deflate, br',
  'accept-language': 'zh-CN,zh;q=0.9',
}
exports.main = async (event, context) => {
  const {status,request}= await  axios.get(event.url,{headers})
  return {
    code:status,
    url:request.res.responseUrl
  }
}

