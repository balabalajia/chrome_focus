const input = document.getElementById('domainInput');
const addBtn = document.getElementById('addBtn');
const container = document.getElementById('blacklistContainer');

function normalizeDomain(rawDomain) {
  if (typeof rawDomain !== 'string') return '';
  const value = rawDomain.trim().toLowerCase();
  if (!value) return '';
  try {
    const maybeUrl = value.startsWith('http://') || value.startsWith('https://') ? value : `http://${value}`;
    const url = new URL(maybeUrl);
    return url.hostname;
  } catch (e) {
    return '';
  }
}

function normalizeUrl(rawUrl) {
  if (typeof rawUrl !== 'string') return '';
  const value = rawUrl.trim();
  if (!value) return '';
  try {
    const url = new URL(value);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return '';
    return `${url.protocol}//${url.host}${url.pathname}${url.search}`;
  } catch (e) {
    return '';
  }
}

function parseStoredEntry(rawEntry) {
  if (typeof rawEntry !== 'string') return null;
  const value = rawEntry.trim();
  if (!value) return null;
  if (value.startsWith('domain:')) {
    const domain = normalizeDomain(value.slice(7));
    return domain ? { type: 'domain', value: domain, stored: `domain:${domain}` } : null;
  }
  if (value.startsWith('url:')) {
    const url = normalizeUrl(value.slice(4));
    return url ? { type: 'url', value: url, stored: `url:${url}` } : null;
  }
  if (value.startsWith('http://') || value.startsWith('https://')) {
    const url = normalizeUrl(value);
    return url ? { type: 'url', value: url, stored: `url:${url}` } : null;
  }
  const domain = normalizeDomain(value);
  return domain ? { type: 'domain', value: domain, stored: `domain:${domain}` } : null;
}

function parseInputToStoredEntry(rawInput) {
  if (typeof rawInput !== 'string') return '';
  const value = rawInput.trim();
  if (!value) return '';
  if (value.startsWith('http://') || value.startsWith('https://')) {
    const url = normalizeUrl(value);
    return url ? `url:${url}` : '';
  }
  const domain = normalizeDomain(value);
  return domain ? `domain:${domain}` : '';
}

function getEntryDisplayText(rawEntry) {
  const entry = parseStoredEntry(rawEntry);
  if (!entry) return rawEntry;
  return entry.type === 'url' ? `[网址] ${entry.value}` : `[域名] ${entry.value}`;
}

function renderBlacklist(blacklist) {
  container.innerHTML = '';
  if (!blacklist || blacklist.length === 0) {
    const li = document.createElement('li');
    li.textContent = '暂无黑名单，请添加';
    container.appendChild(li);
    return;
  }
  blacklist.forEach((entryValue) => {
    const li = document.createElement('li');
    const span = document.createElement('span');
    span.textContent = getEntryDisplayText(entryValue);

    const removeButton = document.createElement('button');
    removeButton.className = 'remove';
    removeButton.textContent = '删除';
    removeButton.addEventListener('click', () => {
      removeDomain(entryValue);
    });

    li.appendChild(span);
    li.appendChild(removeButton);
    container.appendChild(li);
  });
}

// 从存储中获取黑名单并渲染
function loadAndRender() {
  chrome.storage.local.get('blacklist', (result) => {
    const blacklist = result.blacklist || [];
    renderBlacklist(blacklist);
  });
}

function addBlacklistEntry(rawInput) {
  const normalizedEntry = parseInputToStoredEntry(rawInput);
  if (!normalizedEntry) {
    alert('输入无效，请输入域名或完整网址（http/https）');
    return;
  }
  chrome.storage.local.get('blacklist', (result) => {
    let blacklist = result.blacklist || [];
    const normalizedList = blacklist.map((item) => {
      const parsed = parseStoredEntry(item);
      return parsed ? parsed.stored : '';
    }).filter(Boolean);
    if (!normalizedList.includes(normalizedEntry)) {
      normalizedList.push(normalizedEntry);
      blacklist = normalizedList;
      chrome.storage.local.set({ blacklist }, () => {
        loadAndRender();
        input.value = '';
      });
    } else {
      alert('该条目已在黑名单中');
    }
  });
}

function removeDomain(entryValue) {
  chrome.storage.local.get('blacklist', (result) => {
    let blacklist = result.blacklist || [];
    blacklist = blacklist.filter(d => d !== entryValue);
    chrome.storage.local.set({ blacklist }, loadAndRender);
  });
}

addBtn.addEventListener('click', () => {
  addBlacklistEntry(input.value);
});

input.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    addBlacklistEntry(input.value);
  }
});

loadAndRender();
