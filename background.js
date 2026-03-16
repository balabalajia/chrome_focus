function normalizeDomain(domain) {
  if (typeof domain !== 'string') {
    return '';
  }
  const value = domain.trim().toLowerCase();
  if (!value) {
    return '';
  }
  try {
    const maybeUrl = value.startsWith('http://') || value.startsWith('https://') ? value : `http://${value}`;
    const url = new URL(maybeUrl);
    return url.hostname;
  } catch (e) {
    return '';
  }
}

function normalizeUrl(rawUrl) {
  if (typeof rawUrl !== 'string') {
    return '';
  }
  const value = rawUrl.trim();
  if (!value) {
    return '';
  }
  try {
    const url = new URL(value);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return '';
    }
    return `${url.protocol}//${url.host}${url.pathname}${url.search}`;
  } catch (e) {
    return '';
  }
}

function parseStoredEntry(rawEntry) {
  if (typeof rawEntry !== 'string') {
    return null;
  }
  const value = rawEntry.trim();
  if (!value) {
    return null;
  }
  if (value.startsWith('domain:')) {
    const domain = normalizeDomain(value.slice(7));
    return domain ? { type: 'domain', value: domain } : null;
  }
  if (value.startsWith('url:')) {
    const url = normalizeUrl(value.slice(4));
    return url ? { type: 'url', value: url } : null;
  }
  if (value.startsWith('http://') || value.startsWith('https://')) {
    const url = normalizeUrl(value);
    return url ? { type: 'url', value: url } : null;
  }
  const domain = normalizeDomain(value);
  return domain ? { type: 'domain', value: domain } : null;
}

function serializeEntry(entry) {
  if (!entry) {
    return '';
  }
  return `${entry.type}:${entry.value}`;
}

function escapeForRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildDynamicRule(entry, id) {
  const regexFilter = entry.type === 'url'
    ? `^${escapeForRegex(entry.value)}$`
    : `^https?:\\/\\/(?:[^\\/]+\\.)?${escapeForRegex(entry.value)}(?:[\\/:?#]|$)`;

  return {
    id,
    priority: 1,
    action: {
      type: 'redirect',
      redirect: {
        extensionPath: '/blocked.html'
      }
    },
    condition: {
      regexFilter,
      resourceTypes: ['main_frame', 'sub_frame']
    }
  };
}

function syncBlacklistRules(rawBlacklist) {
  const parsedEntries = Array.isArray(rawBlacklist) ? rawBlacklist.map(parseStoredEntry).filter(Boolean) : [];
  const uniqueEntries = [...new Set(parsedEntries.map(serializeEntry))]
    .map((item) => parseStoredEntry(item))
    .filter(Boolean);
  const addRules = uniqueEntries.map((entry, index) => buildDynamicRule(entry, index + 1));

  chrome.declarativeNetRequest.getDynamicRules((existingRules) => {
    const removeRuleIds = existingRules.map((rule) => rule.id);

    chrome.declarativeNetRequest.updateDynamicRules(
      {
        removeRuleIds,
        addRules
      },
      () => {
        if (chrome.runtime.lastError) {
          console.error('更新动态规则失败:', chrome.runtime.lastError.message);
        }
      }
    );
  });
}

function loadAndSyncRules() {
  chrome.storage.local.get('blacklist', (result) => {
    syncBlacklistRules(result.blacklist || []);
  });
}

loadAndSyncRules();

chrome.runtime.onInstalled.addListener(() => {
  loadAndSyncRules();
});

chrome.runtime.onStartup.addListener(() => {
  loadAndSyncRules();
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.blacklist) {
    syncBlacklistRules(changes.blacklist.newValue || []);
  }
});
