# Qubic 矿机监控技能 - 安装说明

## 技能位置
```
~/.agents/skills/qubic-miner-monitor/
```

## 快速开始

### 1. 安装依赖
```bash
cd ~/.agents/skills/qubic-miner-monitor
npm install
```

### 2. 配置技能
```bash
node scripts/configure.js
```

按提示输入：
- **Qubic 钱包地址** - 你的 Apool 矿池账户（例如：CP_l803exlxmm）
- **方糖 SendKey** - 从 https://sct.ftqq.com/ 获取
- **离线告警阈值** - 超过多少台离线才告警（默认：1）
- **报告间隔** - 每 X 小时发送一次状态报告（默认：1）

### 3. 测试推送
```bash
node scripts/test-push.js
```

### 4. 测试监控
```bash
node scripts/monitor.js
```

### 5. 设置定时任务
编辑 crontab：
```bash
crontab -e
```

根据你的报告间隔添加对应的定时任务：

**每小时报告一次：**
```
0 * * * * cd ~/.agents/skills/qubic-miner-monitor && node scripts/monitor.js >> logs/monitor.log 2>&1
```

**每 2 小时报告一次：**
```
0 */2 * * * cd ~/.agents/skills/qubic-miner-monitor && node scripts/monitor.js >> logs/monitor.log 2>&1
```

**每 3 小时报告一次：**
```
0 */3 * * * cd ~/.agents/skills/qubic-miner-monitor && node scripts/monitor.js >> logs/monitor.log 2>&1
```

## 文件结构
```
qubic-miner-monitor/
├── SKILL.md              # 技能说明
├── INSTALL.md            # 安装说明（本文件）
├── package.json          # 依赖配置
├── config.json           # 配置文件（用户编辑）
├── config.template.json  # 配置模板
├── data.json             # 监控数据（自动生成）
├── logs/
│   └── monitor.log       # 运行日志
└── scripts/
    ├── monitor.js        # 主监控脚本（检查 + 推送）
    ├── test-push.js      # 测试推送
    ├── configure.js      # 配置向导
    └── push-status.js    # 仅推送状态报告
```

## 常用命令

```bash
# 查看矿机状态并推送到方糖
node scripts/monitor.js

# 仅推送当前状态到方糖
node scripts/push-status.js

# 测试推送功能
node scripts/test-push.js

# 重新配置
node scripts/configure.js

# 查看运行日志
tail -f logs/monitor.log

# 查看最新数据
cat data.json
```

## 配置说明

编辑 `config.json`：

```json
{
  "account": "CP_l803exlxmm",        // Qubic 钱包地址
  "offlineThreshold": 1,              // 离线告警阈值
  "reportInterval": 1,                // 报告间隔（小时）
  "serverChan": {
    "sendKey": "SCTxxxxxxxx",         // 方糖 SendKey
    "enabled": true                   // 是否启用推送
  }
}
```

## 功能说明

### 定期状态报告
- 每次执行 `monitor.js` 都会发送状态报告到方糖
- 通过 crontab 定时执行实现定期报告
- 报告间隔由 `reportInterval` 配置决定

### 离线告警
- 当离线矿机数量 > 阈值时，发送告警消息
- 告警消息包含详细统计信息和警告提示

## 获取帮助
查看 SKILL.md 获取详细使用说明和故障排除指南。

## 版本要求
- Node.js >= 14.0.0
- Playwright（自动安装）
- 需要访问外网（Apool 和 方糖 API）
