const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '../docs/content-loader.js'), 'utf8');

function element() {
    return {
        textContent: '', innerHTML: '', children: [], attributes: {}, listeners: {},
        setAttribute(k, v) { this.attributes[k] = v; },
        removeAttribute(k) { delete this.attributes[k]; },
        replaceChildren() { this.children = []; this.textContent = ''; this.innerHTML = ''; },
        append(...items) { this.children.push(...items); },
        addEventListener(k, v) { this.listeners[k] = v; }
    };
}
function setup(fetch) {
    const context = vm.createContext({
        fetch, URL, AbortController, setTimeout, clearTimeout,
        console: { error() {} }, marked: { parse: text => `<article>${text}</article>` },
        document: { baseURI: 'https://example.test/jd-hub/', createElement: element }
    });
    vm.runInContext(source, context);
    return context;
}
const entry = { content_path: 'content/가이드 공고.md', content_version: '123' };
const response = (text, status = 200, type = 'text/markdown') => ({
    ok: status === 200, status, headers: { get: () => type }, text: async () => text
});

test('relative paths, versioned cache and concurrent request deduplication', async () => {
    let calls = 0;
    const c = setup(async url => {
        calls++;
        assert.equal(new URL(url).pathname, '/jd-hub/content/%EA%B0%80%EC%9D%B4%EB%93%9C%20%EA%B3%B5%EA%B3%A0.md');
        assert.equal(new URL(url).searchParams.get('v'), '123');
        return response('\uFEFF# 내용');
    });
    assert.deepEqual(await Promise.all([c.fetchMarkdown(entry), c.fetchMarkdown(entry)]), ['# 내용', '# 내용']);
    await c.fetchMarkdown(entry);
    assert.equal(calls, 1);
});

test('404 and HTML fallback are rejected, failed requests can retry', async () => {
    let calls = 0;
    const c = setup(async () => ++calls === 1 ? response('', 404) : response('# 복구'));
    await assert.rejects(c.fetchMarkdown(entry), /404/);
    assert.equal(await c.fetchMarkdown(entry), '# 복구');
    const html = setup(async () => response('<html>404</html>', 200, 'text/html'));
    await assert.rejects(html.fetchMarkdown(entry), /HTML/);
});

test('slow previous selection cannot replace the current document', async () => {
    let finishOld;
    const c = setup(url => url.includes('old.md')
        ? new Promise(resolve => { finishOld = resolve; }) : Promise.resolve(response('new')));
    const container = element();
    const old = c.renderMarkdownDocument(container, { content_path: 'content/old.md' });
    await c.renderMarkdownDocument(container, { content_path: 'content/new.md' });
    finishOld(response('old'));
    await old;
    assert.equal(container.innerHTML, '<article>new</article>');
    assert.equal(container.attributes['aria-busy'], undefined);
});

test('error view retry restores content and invokes custom renderer', async () => {
    let calls = 0;
    const c = setup(async () => ++calls === 1 ? response('', 503) : response('recovered'));
    const container = element();
    await c.renderMarkdownDocument(container, entry, text => { container.innerHTML = text.toUpperCase(); });
    assert.equal(container.children[0].attributes.role, 'alert');
    await container.children[1].listeners.click();
    assert.equal(container.innerHTML, 'RECOVERED');
});

test('full-text search preserves substring matching and metadata matches', async () => {
    let calls = 0;
    const c = setup(async url => { calls++; return response(url.includes('one') ? '실무 ROS 2 제어' : '다른 내용'); });
    const entries = [
        { title: '본문 검색', content_path: 'content/one.md' },
        { title: 'ROS 2 제목', content_path: 'content/two.md' },
        { title: '제외', content_path: 'content/three.md' }
    ];
    const found = await c.searchMarkdownEntries(entries, 'ros 2', e => e.title, () => true);
    assert.deepEqual(Array.from(found, e => e.title), ['본문 검색', 'ROS 2 제목']);
    assert.equal(calls, 2);
    await c.searchMarkdownEntries(entries, 'ros 2', e => e.title, () => true);
    assert.equal(calls, 2);
});

test('partial search failure is not reported as a complete result; stale search stops', async () => {
    const c = setup(async () => response('', 404));
    await assert.rejects(c.searchMarkdownEntries([entry], 'missing', () => '', () => true));
    const result = await c.searchMarkdownEntries([entry], 'missing', () => '', () => false);
    assert.equal(result.length, 0);
});
