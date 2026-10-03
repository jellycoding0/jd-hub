// Shared by detail views and full-text search. Failed requests remain retryable.
const markdownCache = new Map();
const markdownRenderRequests = new WeakMap();

function fetchMarkdown(entry) {
    if (!entry || !entry.content_path) return Promise.reject(new Error('Missing Markdown path'));
    const url = new URL(entry.content_path, document.baseURI);
    url.searchParams.set('v', entry.content_version);
    const key = url.href;
    if (!markdownCache.has(key)) {
        const request = (async () => {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 20000);
            try {
                const response = await fetch(key, { signal: controller.signal });
                if (!response.ok) throw new Error(`Markdown HTTP ${response.status}`);
                if ((response.headers.get('content-type') || '').includes('text/html')) {
                    throw new Error('Expected Markdown, received an HTML page');
                }
                return (await response.text()).replace(/^\uFEFF/, '');
            } finally {
                clearTimeout(timeout);
            }
        })();
        markdownCache.set(key, request);
        request.catch(() => markdownCache.delete(key));
    }
    return markdownCache.get(key);
}

function showContentError(container, message, retry) {
    container.replaceChildren();
    const text = document.createElement('p');
    text.setAttribute('role', 'alert');
    text.textContent = message;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'btn-shortcut-interview';
    button.textContent = '다시 시도';
    button.addEventListener('click', retry);
    container.append(text, button);
}

async function renderMarkdownDocument(container, entry, render) {
    const request = Symbol();
    markdownRenderRequests.set(container, request);
    container.setAttribute('aria-busy', 'true');
    container.textContent = '내용을 불러오는 중입니다…';
    try {
        const markdown = await fetchMarkdown(entry);
        if (markdownRenderRequests.get(container) !== request) return;
        if (render) render(markdown);
        else container.innerHTML = marked.parse(markdown);
    } catch (error) {
        if (markdownRenderRequests.get(container) !== request) return;
        console.error('Failed to load Markdown:', error);
        showContentError(container, '내용을 불러오지 못했습니다. 연결 상태를 확인한 뒤 다시 시도해 주세요.',
            () => renderMarkdownDocument(container, entry, render));
    } finally {
        if (markdownRenderRequests.get(container) === request) container.removeAttribute('aria-busy');
    }
}

// Preserve substring searches over the body without embedding it in jobs.js.
// Only search candidates are fetched; repeated searches reuse the same cache.
async function searchMarkdownEntries(entries, query, metadataText, isCurrent) {
    const matches = new Set();
    let next = 0;
    let failed = false;
    async function worker() {
        while (next < entries.length && isCurrent()) {
            const entry = entries[next++];
            const prefix = metadataText(entry).toLowerCase();
            if (prefix.includes(query)) {
                matches.add(entry);
                continue;
            }
            try {
                const markdown = await fetchMarkdown(entry);
                if (`${prefix} ${markdown.toLowerCase()}`.includes(query)) matches.add(entry);
            } catch (error) {
                failed = true;
            }
        }
    }
    await Promise.all(Array.from({ length: Math.min(6, entries.length) }, worker));
    if (!isCurrent()) return [];
    if (failed) throw new Error('Some search documents could not be loaded');
    return entries.filter(entry => matches.has(entry));
}
