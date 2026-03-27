#!/usr/bin/env node
/**
 * 配置 Qubic 监控技能
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const SKILL_DIR = path.dirname(__dirname);
const CONFIG_PATH = path.join(SKILL_DIR, 'config.json');
const TEMPLATE_PATH = path.join(SKILL_DIR, 'config.template.json');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('=== Qubic 矿机监控技能配置 ===\n');

// 加载现有配置或模板
let config = {};
if (fs.existsSync(CONFIG_PATH)) {
  config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
} else if (fs.existsSync(TEMPLATE_PATH)) {
  config = JSON.parse(fs.readFileSync(TEMPLATE_PATH, 'utf8'));
}

console.log('当前配置:');
console.log('- 钱包地址:', config.account?.includes('在此填写') ? '未配置' : (config.account || '未配置'));
console.log('- 离线阈值:', config.offlineThreshold || 1);
console.log('- 报告间隔:', config.reportInterval ? `每 ${config.reportInterval} 小时` : '未配置');
console.log('- 方糖 SendKey:', config.serverChan?.sendKey?.includes('在此填写') ? '未配置' : (config.serverChan?.sendKey ? '已配置' : '未配置'));
console.log('');

// 获取钱包地址
rl.question(`Qubic 钱包地址 (默认：${config.account && !config.account.includes('在此填写') ? config.account : 'CP_xxxxx'}): `, (account) => {
  if (account.trim() && !account.includes('CP_xxxxx')) {
    config.account = account.trim();
  }

  // 获取方糖 SendKey
  rl.question('方糖 (ServerChan) SendKey (必填): ', (sendKey) => {
    if (sendKey.trim()) {
      config.serverChan = config.serverChan || {};
      config.serverChan.sendKey = sendKey.trim();
      config.serverChan.enabled = true;
    }

    // 获取离线阈值
    rl.question(`离线矿机阈值 (默认：${config.offlineThreshold || 1}): `, (threshold) => {
      if (threshold.trim()) {
        config.offlineThreshold = parseInt(threshold.trim()) || 1;
      }

      // 获取报告间隔
      rl.question(`状态报告间隔 (每 X 小时，默认：${config.reportInterval || 1}): `, (interval) => {
        if (interval.trim()) {
          config.reportInterval = parseInt(interval.trim()) || 1;
        } else if (!config.reportInterval) {
          config.reportInterval = 1;
        }

        // 保存配置
        fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
        console.log('\n✅ 配置已保存到:', CONFIG_PATH);
        console.log('\n配置内容:');
        console.log(JSON.stringify(config, null, 2));

        // 验证配置
        console.log('\n=== 配置验证 ===');
        if (!config.account || config.account.includes('在此填写') || config.account.includes('CP_xxxxx')) {
          console.log('⚠️ 警告：钱包地址未配置');
        } else {
          console.log('✅ 钱包地址已配置');
        }

        if (!config.serverChan?.sendKey || config.serverChan.sendKey.includes('在此填写')) {
          console.log('⚠️ 警告：方糖 SendKey 未配置');
        } else {
          console.log('✅ 方糖 SendKey 已配置');
        }

        console.log(`✅ 报告间隔：每 ${config.reportInterval} 小时`);
        console.log(`✅ 告警阈值：${config.offlineThreshold} 台离线`);

        console.log('\n运行以下命令测试:');
        console.log('  node scripts/test-push.js    # 测试推送');
        console.log('  node scripts/monitor.js      # 检查矿机状态');
        console.log('  node scripts/push-status.js  # 发送状态报告');

        console.log('\n=== 定时任务设置 ===');
        const cronMinutes = 0;
        const cronHours = `*/${config.reportInterval}`;
        console.log(`建议的 crontab 配置（每 ${config.reportInterval} 小时执行）:`);
        console.log(`${cronMinutes} ${cronHours} * * * cd ~/.agents/skills/qubic-miner-monitor && node scripts/monitor.js >> logs/monitor.log 2>&1`);

        rl.close();
      });
    });
  });
});
