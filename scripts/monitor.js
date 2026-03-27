#!/usr/bin/env node
/**
 * Qubic 矿机状态监控脚本
 * 用于 AgentSkills 技能
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// 技能目录
const SKILL_DIR = path.dirname(__dirname);
const CONFIG_PATH = path.join(SKILL_DIR, 'config.json');
const LOG_DIR = path.join(SKILL_DIR, 'logs');
const DATA_PATH = path.join(SKILL_DIR, 'data.json');

// 确保日志目录存在
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

// 默认配置
const DEFAULT_CONFIG = {
  account: '',
  offlineThreshold: 1,
  reportInterval: 1,
  serverChan: {
    sendKey: '',
    enabled: true
  }
};

// 加载配置
function loadConfig() {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
      return { ...DEFAULT_CONFIG, ...config };
    }
  } catch (e) {
    console.error('加载配置文件失败:', e.message);
  }
  return DEFAULT_CONFIG;
}

// 记录日志
function log(message) {
  const timestamp = new Date().toISOString();
  const logLine = `[${timestamp}] ${message}\n`;
  console.log(message);
  
  // 写入日志文件
  const logFile = path.join(LOG_DIR, 'monitor.log');
  fs.appendFileSync(logFile, logLine);
}

/**
 * 发送方糖 (ServerChan) 消息
 */
async function sendServerChanAlert(title, desp) {
  const sendKey = CONFIG.serverChan?.sendKey;

  if (!sendKey) {
    log('[方糖推送] 未配置 SendKey，跳过发送');
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
      log('✅ 方糖消息发送成功');
      return true;
    } else {
      log('❌ 方糖消息发送失败:' + JSON.stringify(result));
      return false;
    }
  } catch (error) {
    log('❌ 发送方糖消息失败:' + error.message);
    return false;
  }
}

/**
 * 获取矿机数据
 */
async function fetchMinerData(account) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  // 存储 API 响应
  const apiResponses = [];
  page.on('response', async (response) => {
    const url = response.url();
    const contentType = response.headers()['content-type'] || '';

    if (contentType.includes('json')) {
      try {
        const data = await response.json();
        apiResponses.push({ url, data });
      } catch (e) {
        // 不是 JSON 响应
      }
    }
  });

  try {
    const url = `https://qubic.apool.io/myMiner?account=${account}&self=1`;
    log('正在访问页面:' + url);
    
    await page.goto(url, {
      waitUntil: 'networkidle',
      timeout: 60000
    });

    await page.waitForTimeout(3000);

    // 从 API 响应中提取统计数据
    let statsData = null;
    for (const resp of apiResponses) {
      if (resp.url.includes('mining/statistics')) {
        statsData = resp.data;
        break;
      }
    }

    // 从页面中提取数据
    const pageData = { stats: {} };

    // 如果从 API 获取到数据，优先使用
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
    log('获取矿机数据失败:' + error.message);
    return null;
  } finally {
    await browser.close();
  }
}

/**
 * 格式化输出
 */
function formatOutput(data, account) {
  const status = data.offlineCount > CONFIG.offlineThreshold ? '⚠️ 需要关注' : '✅ 正常';
  
  return `
📊 Qubic 矿机实时状态

**账户:** \`${account}\`
**检查时间:** ${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}

| 状态 | 数量 |
|------|------|
| 🟢 在线 | **${data.onlineCount} 台** |
| 🔴 离线 | **${data.offlineCount} 台** |
| 📈 活跃率 | **${data.stats.activeRatio}%** |
| 🔢 总计 | **${data.totalCount} 台** |

**状态评估:** ${status}
`.trim();
}

/**
 * 生成方糖推送消息
 */
function generatePushMessage(data, account, isAlert = false) {
  const status = data.offlineCount > CONFIG.offlineThreshold ? '⚠️ 需要关注' : '✅ 正常';
  const emoji = isAlert ? '⚠️' : '📊';
  const title = isAlert ? 'Qubic 矿机离线告警' : `Qubic 矿机状态报告`;
  
  const desp = `## ${isAlert ? '⚠️ Qubic 矿机离线告警' : '📊 Qubic 矿机状态报告'}

**账户:** \`${account}\`

**检查时间:** ${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}

| 状态 | 数量 |
|------|------|
| 🟢 在线 | **${data.onlineCount} 台** |
| 🔴 离线 | **${data.offlineCount} 台** |
| 📈 活跃率 | **${data.stats.activeRatio}%** |
| 🔢 总计 | **${data.totalCount} 台** |

**状态评估:** ${status}

${isAlert ? `**警告:** 离线矿机数量 (\`${data.offlineCount}\`) 超过阈值 (\`${CONFIG.offlineThreshold}\`)

请尽快检查矿机状态！` : ''}
---
*此消息由 Qubic 监控技能自动发送*
`;

  return { title: `${emoji} ${title}`, desp };
}

// 加载配置
const CONFIG = loadConfig();

/**
 * 主函数
 */
async function main() {
  log('=== Qubic 矿机状态监控 ===');
  log(`账户:${CONFIG.account} | 报告间隔：每 ${CONFIG.reportInterval} 小时 | 告警阈值：${CONFIG.offlineThreshold}台`);

  if (!CONFIG.account) {
    log('❌ 错误：未配置钱包地址');
    console.log('❌ 请先配置钱包地址');
    console.log('运行：node scripts/configure.js');
    process.exit(1);
  }

  const data = await fetchMinerData(CONFIG.account);

  if (!data) {
    log('❌ 无法获取矿机数据');
    console.log('❌ 无法获取矿机数据，请检查网络连接');
    process.exit(1);
  }

  // 输出状态
  console.log(formatOutput(data, CONFIG.account));

  // 判断是否需要告警
  const isAlert = data.offlineCount > CONFIG.offlineThreshold;

  if (isAlert) {
    log(`⚠️ 警告：离线矿机数量 (${data.offlineCount}) 超过阈值 (${CONFIG.offlineThreshold})`);
    
    // 发送告警消息
    if (CONFIG.serverChan?.enabled) {
      const { title, desp } = generatePushMessage(data, CONFIG.account, true);
      await sendServerChanAlert(title, desp);
    }
  } else {
    log('✅ 矿机状态正常');
    
    // 发送定期状态报告（每次执行都发送）
    if (CONFIG.serverChan?.enabled) {
      const { title, desp } = generatePushMessage(data, CONFIG.account, false);
      await sendServerChanAlert(title, desp);
    }
  }

  // 保存数据到文件
  fs.writeFileSync(DATA_PATH, JSON.stringify({
    timestamp: new Date().toISOString(),
    account: CONFIG.account,
    stats: data.stats,
    onlineCount: data.onlineCount,
    offlineCount: data.offlineCount,
    totalCount: data.totalCount,
    reportInterval: CONFIG.reportInterval
  }, null, 2));
  
  log('数据已保存到:' + DATA_PATH);
}

// 运行主函数
main().catch(err => {
  log('错误:' + err.message);
  console.error('❌ 错误:', err.message);
  process.exit(1);
});
