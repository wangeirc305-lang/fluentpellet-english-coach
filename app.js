const phases={
  1:{title:'第 1–4 周｜先建立开口反射',desc:'目标不是说得漂亮，而是能在 30 秒内开始表达。用高频句型代替临时翻译，每天录一段 60 秒语音。',weeks:[['W01','自我介绍与公司介绍','能用 6 句话介绍自己、公司和主营产品'],['W02','产品与用途','讲清爽滑、消黄、增韧解决什么问题'],['W03','提问与澄清','掌握 10 个开放式客户问题'],['W04','数字与参数','熟练说价格、比例、温度、交期和数量']]},
  2:{title:'第 5–8 周｜打穿五个业务场景',desc:'把英语放进工作流程：询盘、需求确认、报价、寄样、测试反馈。每周只练一个场景，直到无需看稿。',weeks:[['W05','首次询盘','确认材料、应用和主要痛点'],['W06','报价与条款','解释 MOQ、交期、付款和 Incoterms'],['W07','样品与试机','约定添加量、测试条件和反馈节点'],['W08','质量异议','描述批次、黄度、雾度和稳定性']]},
  3:{title:'第 9–12 周｜进入真实沟通',desc:'将输入换成真实产品资料，将对话对象换成真实潜客。每周形成一项可直接用于业务的英文成果。',weeks:[['W09','英文 TDS 阅读','四步提取用途、添加量、优势、限制'],['W10','3D 打印线材','讲清 PETG 色母、哑光、抗 UV 与验证'],['W11','15 分钟客户会议','完成开场、需求确认、总结和下一步'],['W12','独立跟进','完成一封邮件、一次语音和一次模拟会议']]}
};
const scenes={
 inquiry:{first:'Hi, we are looking for an additive masterbatch for transparent PET sheet. Could you tell me what you offer?',cn:'你好，我们正在寻找用于透明 PET 片材的助剂母粒。你们能提供什么？',hint:'先别急着介绍全部产品。询问应用、当前痛点与关键指标。',replies:['Thanks. Our main issue is that the sheets stick together after winding.','We use APET, and transparency is very important to us.','Our current dosage is around 1%. What would you recommend?']},
 sample:{first:'Your product looks interesting. Can you send us a sample for testing?',cn:'你们的产品看起来不错。可以寄样测试吗？',hint:'确认树脂、设备、测试数量、目标指标和收件信息。',replies:['We need to test it on our high-speed extrusion line.','Please recommend a starting dosage and processing temperature.','Could you also send the TDS and SDS?']},
 quality:{first:'Your price is competitive, but we are worried about batch-to-batch consistency.',cn:'你们的价格有竞争力，但我们担心批次稳定性。',hint:'先承认顾虑，再用 COA、批次追溯和对比测试回应。',replies:['How do you control the yellow index and haze?','Can you provide COA for every batch?','We would need three consistent trial batches before approval.']},
 filament:{first:'We are developing a new PETG filament. Do you have a color masterbatch suitable for high-speed printing?',cn:'我们正在开发新的 PETG 线材。你们有适合高速打印的色母吗？',hint:'询问目标颜色、打印速度、喷嘴温度、载体相容性和测试标准。',replies:['Diameter stability and layer adhesion are our priorities.','We also need a matte black with low moisture.','Can you support a small pilot batch first?']}
};
const vocab=[
 {w:'masterbatch',p:'/ˈmɑːstəbætʃ/',m:'母粒',cat:'material',ex:'We specialize in functional masterbatches for PET sheet.'},
 {w:'batch consistency',p:'/bætʃ kənˈsɪstənsi/',m:'批次一致性',cat:'material',ex:'Batch consistency is critical for our high-speed line.'},
 {w:'dosage',p:'/ˈdəʊsɪdʒ/',m:'添加量；用量',cat:'material',ex:'The recommended dosage is between 0.5% and 1%.'},
 {w:'haze',p:'/heɪz/',m:'雾度',cat:'material',ex:'This grade provides low haze and good slip performance.'},
 {w:'yellow index',p:'/ˈjeləʊ ˈɪndeks/',m:'黄度指数',cat:'material',ex:'We monitor the yellow index for every production batch.'},
 {w:'trial order',p:'/ˈtraɪəl ˈɔːdə/',m:'试订单',cat:'business',ex:'Could we start with a small trial order?'},
 {w:'lead time',p:'/liːd taɪm/',m:'交货周期',cat:'business',ex:'Our standard lead time is two weeks.'},
 {w:'follow up',p:'/ˈfɒləʊ ʌp/',m:'跟进',cat:'business',ex:'I will follow up after your extrusion test.'}
];
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
function renderPhase(n){const p=phases[n];$('#phaseContent').innerHTML=`<div><h3 class="phase-title">${p.title}</h3><p>${p.desc}</p><a class="primary" href="#today">从今天开始</a></div><div class="weeks">${p.weeks.map(w=>`<div class="week"><span>${w[0]}</span><div><b>${w[1]}</b><small>${w[2]}</small></div></div>`).join('')}</div>`}
$$('.phase-tabs button').forEach(b=>b.onclick=()=>{$$('.phase-tabs button').forEach(x=>x.classList.remove('active'));b.classList.add('active');renderPhase(b.dataset.phase)});renderPhase(1);
function saveTasks(){const done=$$('.task input:checked').map(x=>x.dataset.task);localStorage.setItem('fp-tasks',JSON.stringify(done));updateProgress()}
function updateProgress(){const n=$$('.task input:checked').length;$('#progressLabel').textContent=`${n} / 3 完成`;$('#progressBar').style.width=`${n/3*100}%`}
const saved=JSON.parse(localStorage.getItem('fp-tasks')||'[]');$$('.task input').forEach(x=>{x.checked=saved.includes(x.dataset.task);x.onchange=saveTasks});updateProgress();
$('#resetBtn').onclick=()=>{localStorage.removeItem('fp-tasks');$$('.task input').forEach(x=>x.checked=false);updateProgress()};
let scene='inquiry',step=0,lastSpoken='';
function bubble(text,type,translation=''){const d=document.createElement('div');d.className=`bubble ${type}`;d.innerHTML=`${text}${translation?`<span class="translation">${translation}</span>`:''}`;$('#messages').appendChild(d);$('#messages').scrollTop=9999;if(type==='customer')lastSpoken=text}
function loadScene(key){scene=key;step=0;$('#messages').innerHTML='';const s=scenes[key];bubble(s.first,'customer',s.cn);$('#hintText').textContent=s.hint}
$$('.scenario').forEach(b=>b.onclick=()=>{$$('.scenario').forEach(x=>x.classList.remove('active'));b.classList.add('active');loadScene(b.dataset.scene)});loadScene(scene);
$('#chatForm').onsubmit=e=>{e.preventDefault();const input=$('#replyInput');const text=input.value.trim();if(!text)return;bubble(text,'user');input.value='';const s=scenes[scene];setTimeout(()=>{bubble(s.replies[step%s.replies.length],'customer');step++;const good=/could|can|would|recommend|provide|please|what|how|which|confirm/i.test(text);$('#hintText').textContent=good?'很好：你已经在主动推动对话。下一句补充一个具体数据或确认下一步。':'可以更专业：加入一个礼貌提问，如 “Could you tell me…?” 或 “May I confirm…?”';},450)};
function speak(t){if(!('speechSynthesis'in window))return;window.speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(t);u.lang='en-US';u.rate=.86;window.speechSynthesis.speak(u)}
$('#replayBtn').onclick=()=>speak(lastSpoken);
$('#micBtn').onclick=()=>{const SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR){$('#hintText').textContent='当前浏览器不支持语音识别，请使用 Chrome/Edge 或直接输入。';return}const r=new SR();r.lang='en-US';r.interimResults=false;$('#micBtn').textContent='●';r.onresult=e=>{$('#replyInput').value=e.results[0][0].transcript};r.onend=()=>$('#micBtn').textContent='🎙';r.start()};
function renderWords(filter='all'){$('#wordGrid').innerHTML=vocab.filter(v=>filter==='all'||v.cat===filter).map(v=>`<article class="vocab-card" tabindex="0" data-word="${v.w}"><span class="tag">${v.cat==='material'?'MATERIAL':'BUSINESS'}</span><h3>${v.w}</h3><span class="phonetic">${v.p}</span><div class="meaning">${v.m}</div><p class="example">${v.ex}<br><br>点击单词可收起例句 · 双击朗读</p></article>`).join('');$$('.vocab-card').forEach(c=>{c.onclick=()=>c.classList.toggle('open');c.ondblclick=()=>speak(c.dataset.word)})}
renderWords();$$('.filters button').forEach(b=>b.onclick=()=>{$$('.filters button').forEach(x=>x.classList.remove('active'));b.classList.add('active');renderWords(b.dataset.filter)});
