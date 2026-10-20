const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../docs');
const server=http.createServer((req,res)=>{const rel=decodeURIComponent(new URL(req.url,'http://localhost').pathname);const file=path.resolve(root,'.'+(rel==='/'?'/index.html':rel));if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}fs.readFile(file,(e,data)=>{if(e){res.writeHead(404).end();return;}res.setHeader('Content-Type',({'.html':'text/html','.js':'application/javascript','.css':'text/css','.md':'text/plain'})[path.extname(file)]||'application/octet-stream');res.end(data);});});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;try{
browser=await chromium.launch({channel:'msedge',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1000}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto(`http://127.0.0.1:${server.address().port}/#interviews`);
const ready=()=>page.waitForFunction(()=>!document.getElementById('mock-interview-start').disabled);
await ready();const expected=await page.locator('.qna-title-text').allTextContents();
await page.locator('#mock-interview-start').click();assert.equal(await page.locator('#interview-reference-card').isVisible(),false);
const seen=new Set();
for(let i=0;i<5;i++){
const title=await page.locator('#mock-interview-panel h3').textContent();assert(expected.includes(title));assert(!seen.has(title));seen.add(title);
assert.equal(await page.locator('.mock-interview-answer').getAttribute('open'),null);
assert.equal(await page.locator('.mock-interview-answer .markdown-body').isVisible(),false);
await page.locator('.mock-interview-answer summary').click();assert(await page.locator('.mock-interview-answer .markdown-body').isVisible());assert((await page.locator('.mock-interview-answer .markdown-body').textContent()).trim().length>0);
await page.locator('.mock-interview-actions button').first().click();}
assert.equal(await page.locator('.mock-interview-answer').count(),0);
await page.locator('.mock-interview-actions button').first().click();assert.equal(await page.locator('.mock-interview-answer').getAttribute('open'),null);
await page.locator('.mock-interview-actions button').last().click();assert(await page.locator('#interview-reference-card').isVisible());
await page.locator('#mock-interview-start').click();await page.locator('#interview-cat-list button').nth(1).click();await ready();assert.equal(await page.locator('#mock-interview-panel').isVisible(),false);
await page.evaluate(()=>switchTab('strategy'));assert.equal(await page.locator('#mock-interview-toolbar').isVisible(),false);
await page.evaluate(()=>switchTab('interviews'));await ready();await page.setViewportSize({width:390,height:844});await page.locator('#mock-interview-start').click();await page.locator('.mock-interview-answer summary').click();assert(await page.locator('.mock-interview-actions button').first().isVisible());assert(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth));
assert.deepEqual(errors,[]);console.log('PASS: unique questions, answer toggle, completion, restart, return, role reset, strategy isolation, mobile, no JS errors');
}finally{if(browser)await browser.close();server.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
