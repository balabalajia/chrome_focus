# 🚫 chrome_focus - 网址黑名单专注插件

一个轻量、直接、够用的 Chrome 插件：  
把你容易分心的网站加入黑名单，访问时自动拦截，帮你把注意力留给真正重要的事。

---

## 功能特性

- **域名级拦截**：输入 `youtube.com`，自动拦截该域名及其子域名
- **网址级精确拦截**：支持拦截某个完整 URL，不影响同站其它页面
- **即时生效**：添加或删除黑名单后，无需重启浏览器
- **本地存储**：黑名单仅保存在本地，不上传你的输入内容
- **极简操作**：一个设置页即可完成添加、查看、删除

---

## 适用场景

- 工作/学习时屏蔽高频分心站点
- 只封禁某个“容易掉进去”的具体页面
- 临时进入冲刺状态（番茄钟、DDL 前）

---

## 快速开始

### 1) 获取项目

```bash
git clone <your-repo-url>
cd focus
```

### 2) 在 Chrome 中加载插件

1. 打开 `chrome://extensions/`
2. 开启右上角 **开发者模式**
3. 点击 **加载已解压的扩展程序**
4. 选择本项目目录 `focus/`

### 3) 使用方式

1. 打开插件的 **选项页**
2. 输入你要屏蔽的内容并点击“添加”：
   - 域名：`example.com`
   - 完整网址：`https://example.com/path?a=1`
3. 访问命中规则的网址时，会自动跳转到阻止页

---

## 规则说明

### 域名规则

- 输入：`zhihu.com`
- 效果：拦截 `zhihu.com`、`www.zhihu.com`、`xxx.zhihu.com`

### 网址规则（精确匹配）

- 输入：`https://www.zhihu.com/question/xxx/answer/yyy?from=abc`
- 效果：只拦截这条完整 URL
- 注意：若路径或查询参数变化，会被视为不同网址

---

## 隐私与安全

- 插件不记录键盘输入内容，不上传浏览历史
- 黑名单数据仅存储在浏览器本地（`chrome.storage.local`）
- 使用 Manifest V3 推荐的 `declarativeNetRequest` 规则机制

---

## 项目结构

```text
focus/
├── manifest.json      # 插件清单与权限配置
├── background.js      # 动态拦截规则同步逻辑
├── options.html       # 黑名单设置页
├── options.js         # 设置页交互逻辑
├── blocked.html       # 拦截提示页
├── blocked.js         # 拦截页显示逻辑
└── icon.png           # 插件图标
```

---

## 开发与调试

- 修改代码后，在 `chrome://extensions/` 点击插件的 **重新加载**
- 打开选项页或拦截页，使用 DevTools 查看前端日志
- 查看 Service Worker 日志：扩展详情页 → **Service Worker**

---

## 常见问题

### 为什么我输入了网址却没有拦截？

- 请确认输入的是完整 `http/https` 网址
- 网址精确拦截会校验查询参数，参数不同即不同规则
- 更新代码后请先在扩展页重新加载插件

### 可以同时混用域名和具体网址吗？

可以。两种规则会并行生效。

---

## 贡献  

欢迎提交 Issue / PR，一起把这个小工具打磨得更顺手。

---

## License

MIT

