# 📊 A池 Qubic 矿机监控技能 

> 你的24小时私人管家，状态随时掌握！发给openclaw安装

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D14.0.0-green.svg)](https://nodejs.org/)
[![Playwright](https://img.shields.io/badge/Playwright-✓-blue.svg)](https://playwright.dev/)

---

## 🎯 功能特性

- ⏰ **定期状态报告** - 每 X 小时自动推送矿机状态到微信
- 🚨 **离线告警** - 矿机离线超过阈值时立即推送告警
- 📱 **微信推送** - 通过方糖 (ServerChan) 推送到微信，无需额外 APP
- ⚙️ **灵活配置** - 自定义报告间隔和告警阈值
- 📊 **详细统计** - 在线数量、离线数量、活跃率一目了然

---

## 📸 推送效果

### 正常状态报告
```
📊 Qubic 矿机状态报告

账户：CP_xxxxx
检查时间：2026-03-27 19:00:00

| 状态 | 数量 |
|------|------|
| 🟢 在线 | 52 台 |
| 🔴 离线 | 1 台 |
| 📈 活跃率 | 98.11% |
| 🔢 总计 | 53 台 |

状态评估：✅ 正常
```

### 异常告警消息
```
⚠️ Qubic 矿机离线告警

账户：CP_xxxxx
检查时间：2026-03-27 19:00:00

| 状态 | 数量 |
|------|------|
| 🟢 在线 | 50 台 |
| 🔴 离线 | 3 台 |
| 📈 活跃率 | 94.34% |

⚠️ 警告：离线矿机数量 (3) 超过阈值 (1)
请尽快检查矿机状态！
```

---

## 🚀 快速开始

### 前置要求

- Node.js >= 14.0.0
- npm
- 方糖 (ServerChan) 账号

### 1. 安装

```bash
# 克隆仓库
git clone https://github.com/youtangge/qubic-miner-monitor.git
cd qubic-miner-monitor

# 安装依赖
npm install
```

### 2. 获取方糖 SendKey

1. 关注方糖微信公众号
2. 注册/登录账号
3. 在后台获取 **SendKey**（类似 `SCTxxxxxxxxxx`）

### 3. 配置技能

运行配置向导：
```bash
node scripts/configure.js
```

按提示输入：
- **Qubic 钱包地址** - 你的 Apool 矿池账户（例如：`CP_lxxxxxm`）
- **方糖 SendKey** - 刚才获取的 SendKey
- **离线告警阈值** - 超过几台离线才告警（推荐：1）
- **报告间隔** - 几小时发送一次报告（推荐：1-2）

### 4. 测试推送

```bash
node scripts/test-push.js
```

如果微信收到测试消息，说明配置成功！🎉

### 5. 设置定时任务

编辑 crontab：
```bash
crontab -e
```

根据你设置的报告间隔添加对应配置：

**每小时报告一次：**
```bash
0 * * * * cd /path/to/qubic-miner-monitor && node scripts/monitor.js >> logs/monitor.log 2>&1
```

**每 2 小时报告一次：**
```bash
0 */2 * * * cd /path/to/qubic-miner-monitor && node scripts/monitor.js >> logs/monitor.log 2>&1
```

**每 6 小时报告一次：**
```bash
0 */6 * * * cd /path/to/qubic-miner-monitor && node scripts/monitor.js >> logs/monitor.log 2>&1
```

---

## 📖 使用说明

### 常用命令

```bash
# 查看矿机状态并推送报告
node scripts/monitor.js

# 仅推送当前状态（不检查）
node scripts/push-status.js

# 测试推送功能
node scripts/test-push.js

# 重新配置
node scripts/configure.js

# 查看运行日志
tail -f logs/monitor.log
```

### 配置说明

配置文件位于 `config.json`：

```json
{
  "account": "CP_xxxxx",           // Qubic 钱包地址
  "offlineThreshold": 1,           // 离线告警阈值（台）
  "reportInterval": 1,             // 报告间隔（小时）
  "serverChan": {
    "sendKey": "SCTxxxxxxxxxx",    // 方糖 SendKey
    "enabled": true                // 是否启用推送
  }
}
```

| 配置项 | 说明 | 示例 | 必填 |
|--------|------|------|------|
| account | Qubic 钱包地址 | `CP_l803exlxmm` | ✅ |
| offlineThreshold | 超过几台离线才告警 | `1`（2 台离线才提醒） | ✅ |
| reportInterval | 几小时发送一次报告 | `1`（每小时） | ✅ |
| serverChan.sendKey | 方糖推送密钥 | `SCTxxxxxxxxxx` | ✅ |

---

## 📁 项目结构

```
qubic-miner-monitor/
├── README.md              # 项目说明（本文件）
├── SKILL.md               # 详细技能文档
├── INSTALL.md             # 安装指南
├── package.json           # 依赖配置
├── config.json            # 配置文件（需自行创建）
├── config.template.json   # 配置模板
├── .gitignore             # Git 忽略文件
├── LICENSE                # MIT 许可证
├── logs/                  # 日志目录（自动生成）
│   └── monitor.log
└── scripts/
    ├── monitor.js         # 主监控脚本
    ├── test-push.js       # 测试推送
    ├── configure.js       # 配置向导
    └── push-status.js     # 推送状态报告
```

---

## ⚙️ 配置建议

### 报告间隔设置

| 间隔 | 适合场景 | 推送频率 |
|------|----------|----------|
| 1 小时 | 密切关注矿机状态 | 24 次/天 |
| 2 小时 | **推荐**，日常使用 | 12 次/天 |
| 3 小时 | 平衡频率和信息 | 8 次/天 |
| 6 小时 | 减少推送打扰 | 4 次/天 |

### 告警阈值设置

| 矿机总数 | 推荐阈值 | 说明 |
|----------|----------|------|
| 50 台以上 | 2-3 | 避免频繁告警 |
| 20-50 台 | 1-2 | 平衡敏感度 |
| 20 台以下 | 1 | 及时发现异常 |

---

## ❓ 常见问题

### Q: 收不到推送怎么办？

**A:** 按以下步骤排查：

1. 测试推送功能
   ```bash
   node scripts/test-push.js
   ```

2. 检查 SendKey 是否正确
   ```bash
   cat config.json
   ```

3. 查看日志
   ```bash
   tail -f logs/monitor.log
   ```

4. 确认方糖账号正常，可以手动发送测试消息

### Q: 显示"无法获取矿机数据"？

**A:** 检查以下几点：

1. 网络连接是否正常
2. 钱包地址是否正确（区分大小写）
3. Apool 网站是否可访问：https://qubic.apool.io/

### Q: 如何修改配置？

**A:** 两种方式：

1. 重新运行配置向导
   ```bash
   node scripts/configure.js
   ```

2. 直接编辑配置文件
   ```bash
   nano config.json
   ```

### Q: 日志文件在哪里？

**A:** 日志位于 `logs/monitor.log`

查看最新日志：
```bash
tail -f logs/monitor.log
```

查看完整日志：
```bash
cat logs/monitor.log
```

---

## 🔒 隐私说明

- ✅ 所有数据只在本地存储
- ✅ 不会上传任何信息到第三方服务器（除方糖推送外）
- ✅ 不包含任何追踪代码
- ⚠️ `config.json` 包含个人敏感信息，请勿上传到公开仓库

---

## 📝 更新日志

### v1.1.0 (2026-03-27)
- ✨ 新增定期状态报告功能
- ✨ 支持自定义报告间隔
- 🐛 优化日志输出
- 📖 完善文档

### v1.0.0 (2026-03-27)
- 🎉 初始版本发布
- ⏰ 定时监控矿机状态
- 🚨 离线告警推送
- 📱 方糖推送集成

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

---

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

---

## 💡 小贴士

1. **首次使用**建议先运行 `node scripts/test-push.js` 测试推送
2. **配置文件**可以随时修改，无需重启脚本
3. **定时任务**修改后记得保存 crontab (`:wq` 保存退出)
4. **日志文件**会记录每次运行状态，出问题时优先查看

---

## 📞 支持

如有问题或建议：

- 📖 查看 [SKILL.md](SKILL.md) 获取详细技术文档
- 🐛 提交 [Issue](https://github.com/youtangge/qubic-miner-monitor/issues)
- 📧 发送邮件至：your-email@example.com

---

---

<div align="center">

**Made with ❤️ by OpenClaw**

[⬆ 返回顶部](#-qubic-矿机监控技能)

</div>
