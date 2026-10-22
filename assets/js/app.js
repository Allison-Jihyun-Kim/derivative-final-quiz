const pages = [...document.querySelectorAll('.page')];
let current = 0;
let graded = null;
let quizStarted = false;
const lockedAnswers = {};

const ANSWERS = {
  q1: '2', q2: '100', q3: '-4', q4: ['ㄱ','ㄴ'], q5: '32', q6: '3', q7: 'a>=8', q8: '4'
};
const ORIGINAL_NUMBERS = ['06','08','10','12','09','11','14','16'];
const CORRECT_DISPLAY = ['2','100','−4','ㄱ, ㄴ','32','3','a≥8','4'];

function scale(){
  const s = Math.min(innerWidth/1180, innerHeight/820);
  document.getElementById('stage').style.transform = `scale(${s})`;
}
addEventListener('resize', scale); scale();

function initDots(){
  const d = document.getElementById('dots');
  pages.forEach((_,i)=>{
    const dot = document.createElement('span');
    dot.className = 'dot'+(i===0?' active':'');
    d.appendChild(dot);
  });
}

function go(i){
  // Navigation is intentionally forward-only after quiz begins.
  if (quizStarted && i < current) return;
  current = Math.max(0, Math.min(i, pages.length-1));
  pages.forEach((p,j)=>p.classList.toggle('active', j===current));
  document.querySelectorAll('.dot').forEach((d,j)=>d.classList.toggle('active', j===current));
  document.getElementById('pageTitle').textContent = pages[current].dataset.title;
  document.getElementById('pageIndicator').textContent = `${current+1} / ${pages.length}`;
  document.getElementById('navError').textContent = '';
  const next = document.getElementById('nextBtn');
  if(current===0){
    next.style.display='none';
    document.getElementById('navLabel').textContent='학생 정보 입력';
  } else if(current===pages.length-1){
    next.style.display='none';
    document.getElementById('navLabel').textContent='최종 결과';
    if(!graded) grade();
  } else {
    next.style.display='inline-block';
    next.textContent = current===8 ? '결과 확인 ▶' : '다음 문제 ▶';
    document.getElementById('navLabel').textContent=`${current} / 8`;
  }
  drawAll();
}

document.getElementById('nextBtn').onclick = () => advance();
document.getElementById('startBtn').onclick = () => {
  syncStudent();
  if(!studentValid()) return;
  quizStarted = true;
  document.getElementById('studentId').disabled = true;
  document.getElementById('studentName').disabled = true;
  go(1);
};

['studentId','studentName'].forEach(id=>document.getElementById(id).addEventListener('input',syncStudent));
function syncStudent(){
  const id=document.getElementById('studentId').value.trim();
  const nm=document.getElementById('studentName').value.trim();
  document.getElementById('miniId').textContent=id||'학번 미입력';
  document.getElementById('miniName').textContent=nm||'이름 미입력';
}
function studentValid(){
  const id=document.getElementById('studentId'), nm=document.getElementById('studentName');
  let ok=true;
  [id,nm].forEach(e=>e.style.borderColor='#cddbeb');
  if(!/^\d{5}$/.test(id.value.trim())){id.style.borderColor='#d9485f';ok=false}
  if(!nm.value.trim()){nm.style.borderColor='#d9485f';ok=false}
  if(!ok){document.querySelector('.lock-note').textContent='학번은 5자리 숫자(예: 21229), 이름은 빠짐없이 입력하세요.';}
  return ok;
}

function norm(s){
  return String(s??'').trim().toLowerCase().replace(/\s+/g,'').replace(/≥/g,'>=').replace(/∞/g,'inf').replace(/−/g,'-');
}
function q7ok(v){
  const n=norm(v).replace(/a/g,'');
  return ['>=8','8<=','[8,inf)','[8,+inf)'].includes(n)||norm(v)==='a>=8';
}

function currentAnswer(qnum){
  if(qnum===1) return document.getElementById('q1').value;
  if(qnum===2) return document.getElementById('q2').value;
  if(qnum===3) return document.getElementById('q3').value;
  if(qnum===4) return [...document.querySelectorAll('input[name=q4]:checked')].map(e=>e.value).sort();
  if(qnum===5) return document.getElementById('q5').value;
  if(qnum===6) return document.getElementById('q6').value;
  if(qnum===7) return document.getElementById('q7').value;
  if(qnum===8) return document.getElementById('q8').value;
  return '';
}
function answerFilled(ans){
  return Array.isArray(ans) ? ans.length>0 : String(ans).trim()!=='';
}
function lockCurrentPage(){
  const page=pages[current];
  page.querySelectorAll('input').forEach(el=>el.disabled=true);
}
function advance(){
  if(current<1 || current>8) return;
  const ans=currentAnswer(current);
  if(!answerFilled(ans)){
    document.getElementById('navError').textContent='답을 입력한 후 다음 문제로 넘어가세요.';
    return;
  }
  lockedAnswers['q'+current] = Array.isArray(ans) ? [...ans] : String(ans).trim();
  lockCurrentPage();
  go(current+1);
}

function getAnswers(){
  const a={};
  for(let i=1;i<=8;i++) a['q'+i]=lockedAnswers['q'+i] ?? currentAnswer(i);
  return a;
}
function grade(){
  const a=getAnswers();
  const ok={
    q1:Number(a.q1)===2,
    q2:Number(a.q2)===100,
    q3:Number(a.q3)===-4,
    q4:JSON.stringify(a.q4)===JSON.stringify(['ㄱ','ㄴ']),
    q5:Number(a.q5)===32,
    q6:Number(a.q6)===3,
    q7:q7ok(a.q7),
    q8:Number(a.q8)===4
  };
  const cnt=Object.values(ok).filter(Boolean).length;
  const score=Math.round(cnt/8*100);
  graded={answers:a,ok,cnt,score};
  renderResults();
  return graded;
}
function renderResults(){
  if(!graded) return;
  document.getElementById('scoreBig').textContent=`${graded.cnt} / 8`;
  document.getElementById('correctCount').textContent=`8문항 중 ${graded.cnt}문항 정답 · ${graded.score}점`;
  const list=document.getElementById('resultList');
  list.innerHTML='';
  let wrongCount=0;
  for(let i=1;i<=8;i++){
    const good=graded.ok['q'+i];
    if(good) continue;
    wrongCount++;
    const div=document.createElement('div');
    div.className='result-item wrong';
    div.innerHTML=`<b>퀴즈 ${i}번</b><span>교과서 ${ORIGINAL_NUMBERS[i-1]}번</span><strong>정답 ${CORRECT_DISPLAY[i-1]}</strong>`;
    list.appendChild(div);
  }
  if(wrongCount===0){
    const div=document.createElement('div');
    div.className='perfect-box';
    div.textContent='모든 문제를 맞혔습니다!';
    list.appendChild(div);
  }
  document.getElementById('submitStudent').textContent=`학번 ${document.getElementById('studentId').value.trim()} · ${document.getElementById('studentName').value.trim()}`;
}

function payload(){
  if(!graded) grade();
  const id=crypto?.randomUUID?crypto.randomUUID():`${Date.now()}-${Math.random()}`;
  const p={
    assignment:'Ⅱ. 미분 대단원 마무리 하기',
    studentId:document.getElementById('studentId').value.trim(),
    studentName:document.getElementById('studentName').value.trim(),
    score:graded.score,
    correctCount:graded.cnt,
    answerPattern:Object.keys(graded.ok).map(k=>graded.ok[k]?'O':'X').join(''),
    clientSubmittedAt:new Date().toISOString(), pageUrl:location.href, submissionId:id
  };
  for(let i=1;i<=8;i++){
    let ans=graded.answers['q'+i];
    if(Array.isArray(ans)) ans=ans.join(',');
    p[`q${i}Answer`]=ans;
    p[`q${i}Result`]=graded.ok['q'+i]?'O':'X';
  }
  return p;
}
async function submit(){
  if(!graded) grade();
  const url=window.DERIVATIVE_QUIZ_CONFIG?.GOOGLE_APPS_SCRIPT_WEB_APP_URL||'';
  const status=document.getElementById('submitStatus');
  if(!url||url.includes('PASTE_')){status.textContent='config.js에 Google Apps Script 웹 앱 주소를 입력하세요.';return}
  const body=new URLSearchParams(payload());
  status.textContent='제출 중...';
  try{
    await fetch(url,{method:'POST',mode:'no-cors',headers:{'Content-Type':'application/x-www-form-urlencoded'},body});
    status.textContent='제출 요청을 보냈습니다. 선생님의 Google Sheet에 저장됩니다.';
    document.getElementById('submitBtn').disabled=true;
  }catch(e){status.textContent='제출 중 오류가 발생했습니다.';}
}
document.getElementById('submitBtn').onclick=submit;
document.getElementById('downloadBtn').onclick=()=>{
  if(!graded) grade();
  const p=payload();
  let txt=`Ⅱ. 미분 대단원 마무리 하기\n학번: ${p.studentId}\n이름: ${p.studentName}\n맞은 개수: ${p.correctCount}/8\n점수: ${p.score}\n정오표: ${p.answerPattern}\n\n틀린 문제\n`;
  let wrong=0;
  for(let i=1;i<=8;i++) if(p['q'+i+'Result']==='X'){wrong++;txt+=`퀴즈 ${i}번 (교과서 ${ORIGINAL_NUMBERS[i-1]}번): 정답 ${CORRECT_DISPLAY[i-1]}\n`;}
  if(!wrong) txt+='없음\n';
  const b=new Blob([txt],{type:'text/plain;charset=utf-8'});const u=URL.createObjectURL(b);const a=document.createElement('a');a.href=u;a.download=`미분대단원_${p.studentId}_${p.studentName}.txt`;a.click();URL.revokeObjectURL(u);
};

function axes(ctx,w,h,xmin,xmax,ymin,ymax){
  ctx.clearRect(0,0,w,h);ctx.fillStyle='#fff';ctx.fillRect(0,0,w,h);
  const px=x=>48+(x-xmin)/(xmax-xmin)*(w-70),py=y=>h-34-(y-ymin)/(ymax-ymin)*(h-56);
  ctx.strokeStyle='#dce6f0';ctx.lineWidth=1;
  for(let i=0;i<=6;i++){let xx=48+i*(w-70)/6;ctx.beginPath();ctx.moveTo(xx,18);ctx.lineTo(xx,h-34);ctx.stroke()}
  for(let i=0;i<=5;i++){let yy=18+i*(h-52)/5;ctx.beginPath();ctx.moveTo(48,yy);ctx.lineTo(w-22,yy);ctx.stroke()}
  ctx.strokeStyle='#52677f';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(px(xmin),py(0));ctx.lineTo(px(xmax),py(0));ctx.moveTo(px(0),py(ymin));ctx.lineTo(px(0),py(ymax));ctx.stroke();return{px,py};
}
function drawQ3(){
  const c=document.getElementById('q3Canvas');if(!c)return;const ctx=c.getContext('2d'),{px,py}=axes(ctx,c.width,c.height,-3,4,-3,6);
  ctx.strokeStyle='#222';ctx.lineWidth=3;ctx.beginPath();let first=true;
  for(let x=-2.2;x<=3.2;x+=.03){const y=(x+1)*(x-2);if(first){ctx.moveTo(px(x),py(y));first=false}else ctx.lineTo(px(x),py(y))}ctx.stroke();
  ctx.fillStyle='#222';ctx.font='18px serif';ctx.fillText('y=f′(x)',px(1.6),30);ctx.fillText('−1',px(-1)-12,py(0)+22);ctx.fillText('2',px(2)-4,py(0)+22);
}
function drawQ5(){
  const c=document.getElementById('q5Canvas');if(!c)return;const ctx=c.getContext('2d'),{px,py}=axes(ctx,c.width,c.height,-3.5,3.5,-1,10);
  ctx.strokeStyle='#222';ctx.lineWidth=3;ctx.beginPath();let first=true;
  for(let x=-3;x<=3;x+=.03){const y=9-x*x;if(first){ctx.moveTo(px(x),py(y));first=false}else ctx.lineTo(px(x),py(y))}ctx.stroke();
  const u=1,y=8;ctx.fillStyle='rgba(255,159,67,.22)';ctx.strokeStyle='#f08a24';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(px(-3),py(0));ctx.lineTo(px(3),py(0));ctx.lineTo(px(u),py(y));ctx.lineTo(px(-u),py(y));ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='#222';ctx.font='17px serif';ctx.fillText('y=9−x²',px(1.4),py(7.1));
}
function drawAll(){if(current===3)drawQ3();if(current===5)drawQ5();}

initDots();go(0);syncStudent();
