const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../docs');
const server=http.createServer((req,res)=>{const rel=decodeURIComponent(new URL(req.url,'http://localhost').pathname);const file=path.resolve(root,'.'+(rel==='/'?'/index.html':rel));if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}fs.readFile(file,(e,data)=>{if(e){res.writeHead(404).end();return;}res.setHeader('Content-Type',({'.html':'text/html','.js':'application/javascript','.css':'text/css','.md':'text/plain'})[path.extname(file)]||'application/octet-stream');res.end(data);});});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser, browserServer;try{
browserServer=await chromium.launchServer({channel:'msedge',headless:true});browser=await chromium.connect(browserServer.wsEndpoint());
const page=await browser.newPage({viewport:{width:1440,height:1000}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto(`http://127.0.0.1:${server.address().port}/#strategy`);
const ready=()=>page.waitForSelector('#interview-markdown .strategy-toc');
await ready();
const categories=await page.locator('#tips-cat-list button').count();assert.equal(categories,6);
for(let i=0;i<categories;i++){
await page.locator('#tips-cat-list button').nth(i).click();await ready();
assert.equal(await page.locator('.strategy-toc').count(),1);
assert.equal(await page.locator('.is-strategy .interview-header').isVisible(),false);
assert.equal(await page.locator('#mock-interview-toolbar').isVisible(),false);
assert.equal(await page.locator('.strategy-toc nav button').count(),await page.locator('#interview-markdown h2').evaluateAll(nodes=>nodes.filter(n=>!n.closest('.personality-practice')).length));
const hash=await page.evaluate(()=>location.hash);
await page.locator('.strategy-toc summary').click();
const title=await page.locator('.strategy-toc nav button').last().textContent();
await page.locator('.strategy-toc nav button').last().click();
assert.equal(await page.evaluate(()=>document.activeElement.textContent),title);
assert.equal(await page.evaluate(()=>location.hash),hash);
}
for(const width of [390,320]){
await page.setViewportSize({width,height:844});
await page.locator('#tips-cat-list button').nth(1).click();await ready();
assert.equal(await page.locator('#tips-cat-list').evaluate(e=>getComputedStyle(e).display),'grid');
assert.equal(await page.locator('#tips-cat-list .badge-count').first().isVisible(),false);
const a=await page.locator('#tips-cat-list button').nth(0).boundingBox(),b=await page.locator('#tips-cat-list button').nth(1).boundingBox();
assert(Math.abs(a.y-b.y)<2 && b.x>a.x);assert(a.height>=44);
assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
}
await page.setViewportSize({width:390,height:844});
await page.evaluate(()=>window.scrollTo(0,0));
await page.screenshot({path:require('node:path').join(require('node:os').tmpdir(),'strategy-mobile-review.png')});
await page.evaluate(()=>switchTab('interviews'));
await page.waitForFunction(()=>!document.getElementById('interview-practice-start').disabled);
assert.equal(await page.locator('.strategy-toc').count(),0);
assert(await page.locator('.interview-header').first().isVisible());
await page.evaluate(()=>{location.hash='#interviews/'+encodeURIComponent(strategyCategories[2].name);});
await ready();assert((await page.evaluate(()=>location.hash)).startsWith('#strategy/'));
assert.deepEqual(errors,[]);console.log('PASS: all 6 guides, TOC navigation without hash changes, mobile grid and width, old links, interview isolation');
console.log('Screenshot:',require('node:path').join(require('node:os').tmpdir(),'strategy-mobile-review.png'));
}finally{server.closeAllConnections();server.close();if(browserServer){await Promise.race([browserServer.kill(),new Promise(r=>setTimeout(r,3000))]);try{require('node:child_process').execFileSync('taskkill',['/PID',String(browserServer.process().pid),'/T','/F'],{stdio:'ignore'});}catch{}}}})().then(()=>process.exit(0)).catch(e=>{console.error(e);process.exit(1);});
