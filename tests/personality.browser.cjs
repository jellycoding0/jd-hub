const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../docs');
const server=http.createServer((req,res)=>{const rel=decodeURIComponent(new URL(req.url,'http://localhost').pathname);const file=path.resolve(root,'.'+(rel==='/'?'/index.html':rel));if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}fs.readFile(file,(e,data)=>{if(e){res.writeHead(404).end();return;}res.setHeader('Content-Type',({'.html':'text/html','.js':'application/javascript','.css':'text/css','.md':'text/plain'})[path.extname(file)]||'application/octet-stream');res.end(data);});});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser, browserServer;try{
browserServer=await chromium.launchServer({channel:'msedge',headless:true});browser=await chromium.connect(browserServer.wsEndpoint());
const page=await browser.newPage({viewport:{width:1440,height:1000}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
const url=`http://127.0.0.1:${server.address().port}/#practice/personality`;
await page.goto(url);
const start=()=>page.getByRole('button',{name:'모의인성검사 하기',exact:true});
const next=()=>page.getByRole('button',{name:'다음 페이지',exact:true});
await start().waitFor();
const data=await page.evaluate(async()=>{
const source=await fetchMarkdown(PERSONALITY_DATA),data=personalityPractice.parse(source);
for(const target of [1,6]){
const answers=Object.fromEntries(data.questions.map(q=>[q.id,q.direction==='역방향'?7-target:target]));
const expected=target===1?0:100;
if(!personalityPractice.summarize(data,answers).every(d=>d.average===target&&d.score===expected))throw Error('Reverse scoring');
}
const uniform=Object.fromEntries(data.questions.map(q=>[q.id,6]));
if(!personalityPractice.summarize(data,uniform).every(d=>d.average===3.5&&d.score===50))throw Error('Midpoint scoring');
for(const answers of [{},Object.fromEntries(data.questions.map(q=>[q.id,7]))]){
let rejected=false;try{personalityPractice.summarize(data,answers);}catch{rejected=true;}if(!rejected)throw Error('Invalid answers accepted');
}
for(const invalid of [source.replace('P02','P01'),source.replace('| 정방향 |','| invalid |')]){
let rejected=false;try{personalityPractice.parse(invalid);}catch{rejected=true;}if(!rejected)throw Error('Invalid schema accepted');
}
return data;
});
assert.equal(data.questions.length,60);assert.equal(data.dimensions.length,6);
for(const d of data.dimensions){assert.equal(data.questions.filter(q=>q.dimension===d.name&&q.direction==='정방향').length,5);assert.equal(data.questions.filter(q=>q.dimension===d.name&&q.direction==='역방향').length,5);}
await page.evaluate(()=>markdownCache.clear());
let fail=true;const route='**/content/*';await page.route(route,r=>fail?r.fulfill({status:503,body:'unavailable'}):r.continue());
await start().click();await page.getByRole('alert').waitFor();fail=false;
await page.getByRole('button',{name:'다시 시도',exact:true}).click();await page.locator('fieldset').first().waitFor();
assert.equal(await page.locator('fieldset').count(),5);assert.equal(await page.locator('input[type=radio]').count(),30);
assert(await next().isDisabled());assert(await page.getByRole('button',{name:'이전 페이지',exact:true}).isDisabled());
await page.locator('fieldset').first().locator('input[value="6"]').check();assert(await next().isDisabled());
for(let i=0;i<5;i++)await page.locator('fieldset').nth(i).locator('input[value="6"]').check();
await next().click();assert(await next().isDisabled());
await page.getByRole('button',{name:'이전 페이지',exact:true}).click();assert.equal(await page.locator('input:checked').count(),5);
await page.locator('fieldset').first().locator('input[value="2"]').check();await next().click();await page.getByRole('button',{name:'이전 페이지',exact:true}).click();assert(await page.locator('fieldset').first().locator('input[value="2"]').isChecked());
await page.screenshot({path:path.join(require('node:os').tmpdir(),'personality-desktop-v2.png')});
await page.setViewportSize({width:390,height:844});await page.locator('.personality-practice').scrollIntoViewIfNeeded();
await page.screenshot({path:path.join(require('node:os').tmpdir(),'personality-mobile-v2.png')});
await page.setViewportSize({width:1440,height:1000});
for(let p=0;p<12;p++){
for(let i=0;i<5;i++){
const q=data.questions[p*5+i];
await page.locator(`input[name="personality-${q.id}"][value="${q.direction==='역방향'?1:6}"]`).check();
}
await page.getByRole('button',{name:p===11?'결과 보기':'다음 페이지',exact:true}).click();
}
assert.equal(await page.locator('.personality-result').count(),6);
assert((await page.locator('[role=meter]').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('aria-valuenow')))).every(v=>v==='100'));
assert.equal(await page.locator('.radar-score').count(),1);assert.equal(await page.locator('.radar-reference').count(),1);
assert((await page.locator('.personality-practice').textContent()).includes('다른 응시자의 평균이 아님'));
await page.screenshot({path:path.join(require('node:os').tmpdir(),'personality-results-v2.png')});
for(const width of [390,320]){await page.setViewportSize({width,height:844});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}
await page.getByRole('button',{name:'응답 다시 보기',exact:true}).click();assert.equal(await page.locator('input:checked').count(),5);
for(let p=0;p<12;p++)await page.getByRole('button',{name:p===11?'결과 보기':'다음 페이지',exact:true}).click();
await page.getByRole('button',{name:'처음부터 다시 하기',exact:true}).click();assert.equal(await page.locator('input:checked').count(),0);assert(await next().isDisabled());
for(const width of [390,320]){await page.setViewportSize({width,height:844});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}
await page.locator('fieldset').first().locator('input[value="1"]').focus();await page.keyboard.press('Space');await page.keyboard.press('ArrowRight');assert(await page.locator('fieldset').first().locator('input[value="2"]').isChecked());
await page.getByRole('button',{name:'그만하고 안내로 돌아가기',exact:true}).click();assert(await start().isVisible());
await start().click();await page.locator('fieldset').first().waitFor();assert.equal(await page.locator('input:checked').count(),0);
await page.evaluate(()=>switchTab('interviews'));await page.waitForFunction(()=>!document.getElementById('interview-practice-start').disabled);assert.equal(await page.locator('.personality-practice').count(),0);
await page.goto(url);await start().waitFor();await start().click();await page.locator('fieldset').first().waitFor();await page.reload();await start().waitFor();assert.equal(await page.locator('fieldset').count(),0);
assert.deepEqual(errors,[]);console.log('PASS: 60 balanced questions, 6-point scoring, 5/page, partial-answer guard, retained edits, results/radar/midpoint, restart, keyboard, mobile 320/390, retry, navigation');
}finally{server.closeAllConnections();server.close();if(browserServer){await Promise.race([browserServer.kill(),new Promise(r=>setTimeout(r,3000))]);try{require('node:child_process').execFileSync('taskkill',['/PID',String(browserServer.process().pid),'/T','/F'],{stdio:'ignore'});}catch{}}}})().then(()=>process.exit(0)).catch(e=>{console.error(e);process.exit(1);});
