# Qubic 矿机监控技能

监控 Qubic 矿机状态，定期推送状态报告，当离线矿机数量超过阈值时通过方糖 (ServerChan) 推送告警。

## 功能
- ⏰ **定期状态报告** - 每 X 小时自动推送矿机状态到方糖
- 🚨 **离线告警** - 离线矿机超过阈值时立即告警
- 📊 **实时监控** - 手动查询矿机在线情况
- ⚙️ **灵活配置** - 自定义报告间隔和告警阈值

## 配置

### 必需配置
在使用本技能前，用户需要配置以下信息：

1. **Qubic 钱包地址** - Apool 矿池账户
2. **方糖 SendKey** - ServerChan 推送密钥
3. **报告间隔** - 每 X 小时发送一次状态报告（默认：1 小时）
4. **告警阈值** - 离线矿机超过多少台时告警（默认：1）

### 配置方法

#### 方法 1：使用配置向导（推荐）
```bash
cd ~/.agents/skills/qubic-miner-monitor
node scripts/configure.js
```

按提示输入：
- Qubic 钱包地址
- 方糖 SendKey
- 告警阈值
- 报告间隔（每 X 小时）

#### 方法 2：直接编辑配置文件
编辑 `~/.agents/skills/qubic-miner-monitor/config.json`：

```json
{
  "account": "CP_l803exlxmm",
  "offlineThreshold": 1,
  "reportInterval": 1,
  "serverChan": {
    "sendKey": "SCTxxxxxxxxxxxxxxxxxx",
    "enabled": true
  }
}
```

### 获取方糖 SendKey
1. 访问 https://sct.ftqq.com/
2. 注册/登录账号
3. 在后台获取 SendKey

## 使用

### 手动检查矿机状态
```bash
node scripts/monitor.js
```

### 发送状态报告到方糖
```bash
node scripts/push-status.js
```

### 测试推送
```bash
node scripts/test-push.js
```

### 重新配置
```bash
node scripts/configure.js
```

## 输出格式

### 命令行输出
```
📊 Qubic 矿机实时状态

账户: `CP_l803exlxmm`
检查时间: 2026-03-27 19:00:00

| 状态 | 数量 |
|------|------|
| 🟢 在线 | 52 台 |
| 🔴 离线 | 1 台 |
| 📈 活跃率 | 98.11% |
| 🔢 总计 | 53 台 |

状态评估：✅ 正常
```

### 方糖定期报告
```
📊 Qubic 矿机状态报告

账户：CP_l803exlxmm
检查时间：2026-03-27 19:00:00

| 状态 | 数量 |
|------|------|
| 🟢 在线 | 52 台 |
| 🔴 离线 | 1 台 |
| 📈 活跃率 | 98.11% |
| 🔢 总计 | 53 台 |

状态评估：✅ 正常
```

### 方糖告警消息
```
⚠️ Qubic 矿机离线告警

账户：CP_l803exlxmm
检查时间：2026-03-27 19:00:00

| 状态 | 数量 |
|------|------|
| 🟢 在线 | 50 台 |
| 🔴 离线 | 3 台 |
| 📈 活跃率 | 94.34% |
| 🔢 总计 | 53 台 |

状态评估：⚠️ 需要关注

警告：离线矿机数量 (3) 超过阈值 (1)
请尽快检查矿机状态！
```

## 定时任务设置

### 根据报告间隔设置 crontab

编辑 crontab：
```bash
crontab -e
```

#### 每小时报告一次（默认）
```
0 * * * * cd ~/.agents/skills/qubic-miner-monitor && node scripts/monitor.js >> logs/monitor.log 2>&1
```

#### 每 2 小时报告一次
```
0 */2 * * * cd ~/.agents/skills/qubic-miner-monitor && node scripts/monitor.js >> logs/monitor.log 2>&1
```

#### 每 3 小时报告一次
```
0 */3 * * * cd ~/.agents/skills/qubic-miner-monitor && node scripts/monitor.js >> logs/monitor.log 2>&1
```

#### 每 6 小时报告一次
```
0 */6 * * * cd ~/.agents/skills/qubic-miner-monitor && node scripts/monitor.js >> logs/monitor.log 2>&1
```

## 文件结构
```
~/.agents/skills/qubic-miner-monitor/
├── SKILL.md              # 技能说明（本文件）
├── INSTALL.md            # 安装说明
├── package.json          # 依赖配置
├── config.json           # 配置文件（用户编辑）
├── config.template.json  # 配置模板
├── data.json             # 监控数据（自动生成）
├── logs/
│   └── monitor.log       # 运行日志
└── scripts/
    ├── monitor.js        # 主监控脚本
    ├── test-push.js      # 测试推送
    ├── configure.js      # 配置向导
    └── push-status.js    # 推送状态报告
```

## 告警规则
- **定期报告**: 每次执行都会发送状态报告到方糖
- **告警触发**: 当 **离线矿机数量 > 阈值** 时发送告警消息
- 默认阈值为 1，即有 2 台或以上矿机离线时才告警
- 可根据实际情况调整阈值（建议 1-3）

## 日志
- 运行日志：`~/.agents/skills/qubic-miner-monitor/logs/monitor.log`
- 查看日志：`tail -f ~/.agents/skills/qubic-miner-monitor/logs/monitor.log`
- 最新数据：`cat ~/.agents/skills/qubic-miner-monitor/data.json`

## 注意事项
1. 首次使用前必须配置钱包地址和方糖 SendKey
2. 确保服务器可以访问 https://qubic.apool.io 和 https://sctapi.ftqq.com
3. 脚本使用 Playwright 进行页面抓取，需要安装 Chromium
4. 告警阈值建议设置为 1-2，避免误报
5. 报告间隔不宜过短，避免频繁推送（建议 1-6 小时）

## 故障排除

### 无法获取矿机数据
- 检查网络连接
- 确认 Apool 网站可访问
- 检查钱包地址是否正确

### 方糖推送失败
- 确认 SendKey 配置正确
- 检查方糖账号状态
- 查看日志获取详细错误信息

### 定时任务未执行
- 检查 crontab 配置：`crontab -l`
- 查看日志文件
- 确认 Node.js 路径正确

## 版本
- v1.1.0 - 添加定期状态报告功能
- v1.0.0 - 初始版本
