#!/usr/bin/env node
/**
 * 测试方糖推送
 */

const fs = require('fs');
const path = require('path');

const SKILL_DIR = path.dirname(__dirname);
const CONFIG_PATH = path.join(SKILL_DIR, 'config.json');

async function testServerChan() {
  let config = {};
  if (fs.existsSync(CONFIG_PATH)) {
    config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
  }

  const sendKey = config.serverChan?.sendKey;

  if (!sendKey || sendKey.includes('在此填写')) {
    console.log('❌ 未配置方糖 SendKey');
    console.log('\n请按以下步骤配置:');
    console.log('1. 访问 https://sct.ftqq.com/ 注册/登录');
    console.log('2. 在后台获取 SendKey');
    console.log('3. 编辑 config.json 文件，填入 SendKey');
    return;
  }

  if (!config.account || config.account.includes('在此填写')) {
    console.log('❌ 未配置钱包地址');
    console.log('请先编辑 config.json 配置钱包地址');
    return;
  }

  console.log('正在测试方糖推送...');
  console.log('SendKey:', sendKey.substring(0, 8) + '...');
  console.log('钱包地址:', config.account);

  const title = '🎉 Qubic 监控测试消息';
  const desp = `## 测试消息

这是一条测试消息，用于验证方糖推送是否正常工作。

**配置信息:**
- 账户：${config.account}
- 离线阈值：${config.offlineThreshold || 1}

如果收到此消息，说明推送配置成功！

---
发送时间：${new Date().toISOString()}
`;

  const url = `https://sctapi.ftqq.com/${sendKey}.send`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        text: title,
        desp: desp
      })
    });

    const result = await response.json();

    if (result.code === 0 || result.errno === 0) {
      console.log('✅ 测试消息发送成功！');
      console.log('请检查你的方糖/微信是否收到消息');
    } else {
      console.error('❌ 发送失败:', result);
      if (result.error) {
        console.error('错误信息:', result.error);
      }
    }
  } catch (error) {
    console.error('❌ 发送失败:', error.message);
  }
}

testServerChan();
