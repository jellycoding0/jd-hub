const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../docs');
const server=http.createServer((req,res)=>{const rel=decodeURIComponent(new URL(req.url,'http://localhost').pathname);const file=path.resolve(root,'.'+(rel==='/'?'/index.html':rel));if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}fs.readFile(file,(e,data)=>{if(e){res.writeHead(404).end();return;}res.setHeader('Content-Type',({'.html':'text/html','.js':'application/javascript','.css':'text/css','.md':'text/plain'})[path.extname(file)]||'application/octet-stream');res.end(data);});});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser, browserServer;try{
browserServer=await chromium.launchServer({channel:'msedge',headless:true});browser=await chromium.connect(browserServer.wsEndpoint());
const page=await browser.newPage({viewport:{width:1440,height:1000}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
const url=`http://127.0.0.1:${server.address().port}/#strategy/${encodeURIComponent('인성검사 팁')}`;
await page.goto(url);
const start=()=>page.getByRole('button',{name:'모의인성검사 하기',exact:true});
const next=()=>page.getByRole('button',{name:'다음 질문',exact:true});
await start().waitFor();
const data=await page.evaluate(async()=>{
const data=personalityPractice.parse(await fetchMarkdown(PERSONALITY_DATA));
const uniform=Object.fromEntries(data.questions.map(q=>[q.id,3]));
if(!personalityPractice.summarize(data,uniform).every(d=>d.average===3))throw Error('Neutral scoring');
for(const target of [1,5]){
const answers=Object.fromEntries(data.questions.map(q=>[q.id,q.direction==='역방향'?6-target:target]));
if(!personalityPractice.summarize(data,answers).every(d=>d.average===target))throw Error('Reverse scoring');
}
let rejected=false;try{personalityPractice.summarize(data,{});}catch{rejected=true;}if(!rejected)throw Error('Missing answers accepted');
const source=await fetchMarkdown(PERSONALITY_DATA);
rejected=false;try{personalityPractice.parse(source.replace('P02','P01'));}catch{rejected=true;}if(!rejected)throw Error('Duplicate IDs accepted');
rejected=false;try{personalityPractice.parse(source.replace('| 정방향 |','| invalid |'));}catch{rejected=true;}if(!rejected)throw Error('Invalid direction accepted');
return data;
});
assert.equal(data.questions.length,20);assert.equal(data.dimensions.length,5);
// Network failure is recoverable and does not fabricate an empty result.
await page.evaluate(()=>markdownCache.clear());
const route='**/content/*';let fail=true;
await page.route(route,r=>fail?r.fulfill({status:503,body:'unavailable'}):r.continue());
await start().click();await page.getByRole('alert').waitFor();assert.equal(await page.locator('.personality-result').count(),0);
fail=false;await page.getByRole('button',{name:'다시 시도',exact:true}).click();
await page.locator('.personality-options input').first().waitFor();
assert(await next().isDisabled());assert(await page.getByRole('button',{name:'이전 질문',exact:true}).isDisabled());
await page.locator('.personality-options input[value="5"]').check();await next().click();
await page.getByRole('button',{name:'이전 질문',exact:true}).click();assert(await page.locator('.personality-options input[value="5"]').isChecked());
await page.locator('.personality-options input[value="4"]').check();await next().click();
await page.getByRole('button',{name:'이전 질문',exact:true}).click();assert(await page.locator('.personality-options input[value="4"]').isChecked());
for(let i=0;i<data.questions.length;i++){
const value=data.questions[i].direction==='역방향'?1:5;
await page.locator(`.personality-options input[value="${value}"]`).check();
await page.getByRole('button',{name:i===data.questions.length-1?'결과 보기':'다음 질문',exact:true}).click();
}
assert.equal(await page.locator('.personality-result').count(),5);
assert((await page.locator('.personality-result meter').evaluateAll(nodes=>nodes.map(n=>n.value))).every(v=>v===5));
await page.getByRole('button',{name:'응답 다시 보기',exact:true}).click();assert(await page.locator('.personality-options input[value="5"]').isChecked());
await page.getByRole('button',{name:'그만하고 안내로 돌아가기',exact:true}).click();
assert(await page.locator('.strategy-toc').isVisible());
for(const width of [390,320]){
await page.setViewportSize({width,height:844});await start().click();await page.locator('fieldset').waitFor();
assert(await next().isDisabled());assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
await page.locator('.personality-options input[value="3"]').check();
await next().click();assert(await next().isDisabled());
await page.getByRole('button',{name:'그만하고 안내로 돌아가기',exact:true}).click();
}
await page.setViewportSize({width:390,height:844});await start().click();await page.locator('fieldset').waitFor();
await page.screenshot({path:require('node:path').join(require('node:os').tmpdir(),'personality-mobile-review.png')});
await page.evaluate(()=>switchTab('interviews'));await page.waitForFunction(()=>!document.getElementById('mock-interview-start').disabled);
assert.equal(await page.locator('.personality-practice').count(),0);
await page.evaluate(()=>{switchTab('strategy');renderInterviewItem('인성검사 팁');});await start().waitFor();await start().click();await page.locator('fieldset').waitFor();assert(await next().isDisabled());
await page.reload();await start().waitFor();assert.equal(await page.locator('fieldset').count(),0);
// A response completing after navigation must not reopen the exercise.
await page.evaluate(()=>markdownCache.clear());let release;
const gate=new Promise(resolve=>release=resolve);let pending;
await page.unroute(route);await page.route(route,async r=>{pending=true;await gate;await r.continue();});
await start().click();await page.waitForFunction(()=>document.querySelector('.personality-practice[aria-busy="true"]'));
await page.evaluate(()=>switchTab('jobs'));release();await page.unrouteAll({behavior:'wait'});
assert.equal(await page.locator('.personality-practice').count(),0);
assert.deepEqual(errors,[]);console.log('PASS: MD schema, reverse/neutral scoring, required answers, edit/back, 20-question results, reset/reload, mobile, retry, stale navigation');
console.log('Screenshot:',require('node:path').join(require('node:os').tmpdir(),'personality-mobile-review.png'));
}finally{server.closeAllConnections();server.close();if(browserServer){await Promise.race([browserServer.kill(),new Promise(r=>setTimeout(r,3000))]);try{require('node:child_process').execFileSync('taskkill',['/PID',String(browserServer.process().pid),'/T','/F'],{stdio:'ignore'});}catch{}}}})().then(()=>process.exit(0)).catch(e=>{console.error(e);process.exit(1);});
