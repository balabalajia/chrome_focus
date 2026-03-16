// 显示被阻止的原始URL
const params = new URLSearchParams(location.search);
const originalUrl = params.get('url') || '未知';
document.getElementById('blockedUrl').textContent = originalUrl;

// 设置选项链接（使用扩展内的选项页面）
document.getElementById('optionsLink').href = chrome.runtime.getURL('options.html');