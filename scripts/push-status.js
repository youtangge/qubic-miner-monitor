#!/usr/bin/env node
/**
 * 推送当前矿机状态到方糖
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const SKILL_DIR = path.dirname(__dirname);
const CONFIG_PATH = path.join(SKILL_DIR, 'config.json');

// 加载配置
let config = {};
if (fs.existsSync(CONFIG_PATH)) {
  config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
}

/**
 * 发送方糖消息
 */
async function sendServerChanMessage(title, desp) {
  const sendKey = config.serverChan?.sendKey;

  if (!sendKey) {
    console.log('❌ 未配置方糖 SendKey');
    return false;
  }

  const url = `https://sctapi.ftqq.com/${sendKey}.send`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ text: title, desp })
    });

    const result = await response.json();

    if (result.code === 0 || result.errno === 0) {
      console.log('✅ 方糖消息发送成功');
      return true;
    } else {
      console.error('❌ 发送失败:', result);
      return false;
    }
  } catch (error) {
    console.error('❌ 发送失败:', error.message);
    return false;
  }
}

/**
 * 获取矿机数据
 */
async function fetchMinerData(account) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
  });
  const page = await context.newPage();

  const apiResponses = [];
  page.on('response', async (response) => {
    const url = response.url();
    const contentType = response.headers()['content-type'] || '';
    if (contentType.includes('json')) {
      try {
        const data = await response.json();
        apiResponses.push({ url, data });
      } catch (e) {}
    }
  });

  try {
    await page.goto(`https://qubic.apool.io/myMiner?account=${account}&self=1`, {
      waitUntil: 'networkidle',
      timeout: 60000
    });
    await page.waitForTimeout(3000);

    let statsData = null;
    for (const resp of apiResponses) {
      if (resp.url.includes('mining/statistics')) {
        statsData = resp.data;
        break;
      }
    }

    const pageData = { stats: {} };

    if (statsData?.result) {
      pageData.stats.activeMiners = parseInt(statsData.result.miner_online) || 0;
      pageData.stats.activeRatio = parseFloat(statsData.result.online_rate) || 0;

      if (pageData.stats.activeMiners && pageData.stats.activeRatio) {
        pageData.totalCount = Math.round(pageData.stats.activeMiners / (pageData.stats.activeRatio / 100));
        pageData.onlineCount = pageData.stats.activeMiners;
        pageData.offlineCount = pageData.totalCount - pageData.onlineCount;
      }
    }

    return pageData;
  } catch (error) {
    console.error('获取数据失败:', error.message);
    return null;
  } finally {
    await browser.close();
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('=== 推送矿机状态到方糖 ===\n');

  if (!config.account) {
    console.log('❌ 未配置钱包地址');
    return;
  }

  if (!config.serverChan?.sendKey) {
    console.log('❌ 未配置方糖 SendKey');
    return;
  }

  console.log('账户:', config.account);
  console.log('正在获取矿机数据...\n');

  const data = await fetchMinerData(config.account);

  if (!data) {
    console.log('❌ 无法获取矿机数据');
    return;
  }

  const title = `📊 Qubic 矿机状态报告`;
  const statusText = data.offlineCount > (config.offlineThreshold || 1) ? '⚠️ 需要关注' : '✅ 正常';
  
  const desp = `## Qubic 矿机状态报告

**账户:** \`${config.account}\`

**检查时间:** ${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}

| 状态 | 数量 |
|------|------|
| 🟢 在线 | **${data.onlineCount} 台** |
| 🔴 离线 | **${data.offlineCount} 台** |
| 📈 活跃率 | **${data.stats.activeRatio}%** |
| 🔢 总计 | **${data.totalCount} 台** |

**状态评估:** ${statusText}

---
*此消息由 Qubic 监控技能自动发送*
`;

  console.log('📊 矿机状态:');
  console.log(`   在线：${data.onlineCount} 台`);
  console.log(`   离线：${data.offlineCount} 台`);
  console.log(`   活跃率：${data.stats.activeRatio}%`);
  console.log(`\n正在发送方糖推送...\n`);

  await sendServerChanMessage(title, desp);
}

main().catch(console.error);
