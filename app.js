(function () {
  'use strict';

  var $ = function (selector, root) { return (root || document).querySelector(selector); };
  var $$ = function (selector, root) { return Array.prototype.slice.call((root || document).querySelectorAll(selector)); };
  var storage = {
    get: function (key, fallback) {
      try {
        var value = localStorage.getItem(key);
        return value === null ? fallback : JSON.parse(value);
      } catch (error) { return fallback; }
    },
    set: function (key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); } catch (error) {}
    }
  };

  var state = {
    view: 'dashboard',
    accent: storage.get('fp-accent', 'en-US'),
    bestScore: storage.get('fp-best-score', 0),
    savedWords: storage.get('fp-saved-words', []),
    category: 'all',
    savedOnly: false,
    wordLimit: 24,
    productFilter: 'all',
    phraseIndex: 0,
    scene: 'inquiry',
    sceneStep: 0,
    phase: 1,
    lastClientLine: ''
  };

  var pageNames = {
    dashboard: '今日学习',
    pronunciation: '发音训练',
    vocabulary: '行业词库',
    products: '产品知识',
    conversation: '业务对话',
    roadmap: '12 周计划'
  };

  var phrases = [
    ['Batch consistency is critical for our high-speed extrusion line.', '/bætʃ kənˈsɪstənsi ɪz ˈkrɪtɪkəl fər aʊər haɪ spiːd ɪkˈstruːʒən laɪn/', '批次一致性对我们的高速挤出生产线至关重要。', 'batch /bætʃ/ 的结尾是 /tʃ/；consistency 重音在第二音节。', ['batch /tʃ/', 'consistency /ˈsɪs/', 'extrusion /ˈstruːʒ/']],
    ['What dosage do you recommend for the anti-block masterbatch?', '/wɒt ˈdəʊsɪdʒ duː juː ˌrekəˈmend fər ði ˌænti ˈblɒk ˈmɑːstəbætʃ/', '你建议防粘母粒的添加量是多少？', 'dosage 读作 /ˈdoʊsɪdʒ/，不要读成 dose-age。', ['dosage /ˈdəʊsɪdʒ/', 'recommend /ˌrekəˈmend/', 'masterbatch /ˈbætʃ/']],
    ['The recommended addition rate is between one and two percent.', '/ðə ˌrekəˈmendɪd əˈdɪʃən reɪt ɪz bɪˈtwiːn wʌn ænd tuː pəˈsent/', '建议添加比例为百分之一至百分之二。', 'between one and two 连读，percent 的重音在第二音节。', ['addition /əˈdɪʃən/', 'between /bɪˈtwiːn/', 'percent /pəˈsent/']],
    ['Could you share your target haze and yellow index?', '/kʊd juː ʃeər jɔːr ˈtɑːɡɪt heɪz ænd ˈjeləʊ ˈɪndeks/', '可以告诉我你们的目标雾度和黄度指数吗？', 'Could you 常连读为 /kʊdʒu/，haze 的 /z/ 要发出来。', ['could you /kʊdʒu/', 'haze /heɪz/', 'index /ˈɪndeks/']],
    ['We suggest a small-scale trial before mass production.', '/wi səˈdʒest ə smɔːl skeɪl ˈtraɪəl bɪˈfɔː mæs prəˈdʌkʃən/', '我们建议在量产前先进行小规模试产。', 'suggest 的第二个音节重读；trial 是两个音节。', ['suggest /səˈdʒest/', 'trial /ˈtraɪəl/', 'production /ˈdʌkʃən/']],
    ['This grade improves toughness without affecting transparency.', '/ðɪs ɡreɪd ɪmˈpruːvz ˈtʌfnəs wɪˈðaʊt əˈfektɪŋ trænsˈpærənsi/', '这个牌号可以提高韧性，同时不影响透明度。', 'toughness 中 gh 不发音；transparency 重音靠后。', ['toughness /ˈtʌfnəs/', 'without /wɪˈðaʊt/', 'transparency /ˈpær/']],
    ['Please dry the material thoroughly before processing.', '/pliːz draɪ ðə məˈtɪəriəl ˈθʌrəli bɪˈfɔː ˈprəʊsesɪŋ/', '加工前请将材料充分干燥。', 'thoroughly 的开头是咬舌音 /θ/，共有三个主要音节。', ['material /məˈtɪəriəl/', 'thoroughly /ˈθʌrəli/', 'processing /ˈprəʊsesɪŋ/']],
    ['May I know your annual demand and expected delivery date?', '/meɪ aɪ nəʊ jɔːr ˈænjuəl dɪˈmɑːnd ænd ɪkˈspektɪd dɪˈlɪvəri deɪt/', '请问你们的年需求量和期望交期是多少？', 'annual 是三个音节；expected 的 -ed 单独发 /ɪd/。', ['annual /ˈænjuəl/', 'demand /dɪˈmɑːnd/', 'expected /ɪd/']],
    ['We can provide the COA and technical data sheet with every batch.', '/wi kæn prəˈvaɪd ðə siː əʊ eɪ ænd ˈteknɪkəl ˈdeɪtə ʃiːt wɪð ˈevri bætʃ/', '每个批次我们都可以提供 COA 和技术数据表。', 'COA 按字母读；technical 的 ch 发 /k/。', ['provide /prəˈvaɪd/', 'technical /ˈteknɪkəl/', 'every /ˈevri/']],
    ['The filament has stable diameter and excellent layer adhesion.', '/ðə ˈfɪləmənt hæz ˈsteɪbəl daɪˈæmɪtə ænd ˈeksələnt ˈleɪər ədˈhiːʒən/', '这款线材线径稳定，层间附着力出色。', 'filament 重音在第一音节；adhesion 重音在第二音节。', ['filament /ˈfɪləmənt/', 'diameter /daɪˈæmɪtə/', 'adhesion /ədˈhiːʒən/']],
    ['Could you send us a sample for laboratory evaluation?', '/kʊd juː send ʌs ə ˈsɑːmpəl fər ləˈbɒrətri ɪˌvæljuˈeɪʃən/', '可以寄一份样品给我们做实验室评估吗？', 'laboratory 美音通常弱化中间音节；evaluation 有五个音节。', ['sample /ˈsɑːmpəl/', 'laboratory /ləˈbɒrətri/', 'evaluation /ˈeɪʃən/']],
    ['I will follow up with a quotation and testing proposal today.', '/aɪ wɪl ˈfɒləʊ ʌp wɪð ə kwəʊˈteɪʃən ænd ˈtestɪŋ prəˈpəʊzəl təˈdeɪ/', '我今天会跟进报价和测试方案。', 'quotation 重音在第二音节；proposal 重音也在第二音节。', ['follow up /ˈfɒləʊ ʌp/', 'quotation /kwəʊˈteɪʃən/', 'proposal /prəˈpəʊzəl/']]
  ].map(function (item) {
    return {text: item[0], ipa: item[1], cn: item[2], tip: item[3], phonemes: item[4]};
  });

  var exampleStarts = {
    material: 'We recommend this material for your application: ',
    additive: 'Please confirm the recommended dosage for ',
    production: 'Please monitor this item during the trial: ',
    quality: 'We will include this item in the test report: ',
    business: 'Let us confirm this point before production: ',
    printing: 'We optimized this parameter for stable printing: '
  };

  var vocabulary = (window.FP_VOCAB_TEXT || '').trim().split('\n').filter(Boolean).map(function (line, index) {
    var parts = line.split('|');
    return {
      id: index + 1,
      word: parts[0],
      ipa: parts[1],
      zh: parts[2],
      cat: parts[3],
      example: exampleStarts[parts[3]] + parts[0] + '.'
    };
  });

  var categoryNames = {
    all: '全部',
    material: '材料',
    additive: '助剂',
    production: '生产',
    quality: '质量',
    business: '销售外贸',
    printing: '3D 打印'
  };

  var products = [
    {
      id: 'slip', type: 'masterbatch', image: 'assets/masterbatch-lab.jpg',
      zh: 'PET 爽滑防粘母粒', en: 'PET Slip & Anti-block Masterbatch',
      summary: '降低片材摩擦与叠片粘连，改善开口性和后续热成型效率。',
      tags: ['PET/APET sheet', 'Better release', 'Stable COF'],
      application: 'PET、APET、PETG 片材与热成型包装',
      dosage: '建议从 1.0–2.5% 小试，根据目标 COF 微调。',
      metrics: '动/静摩擦系数、开口性、透明度、析出与热成型表现。',
      caution: '需要同时核对表面张力与后续印刷要求，避免添加量过高。',
      pitch: 'This slip and anti-block masterbatch helps reduce surface friction and sheet blocking while maintaining good transparency. We suggest starting with a 1.5 percent dosage and evaluating the coefficient of friction on your line.'
    },
    {
      id: 'bright', type: 'masterbatch', image: 'assets/masterbatch-lab.jpg',
      zh: 'PET 消黄增亮母粒', en: 'PET Yellowing Reducer & Brightener',
      summary: '修正再生或高温加工带来的黄色调，提升视觉白度与清透感。',
      tags: ['Color correction', 'Higher brightness', 'RPET ready'],
      application: '透明 PET/RPET 片材、瓶胚与透明制品',
      dosage: '通常 0.2–1.0%，需结合原料底色和黄度指数测试。',
      metrics: 'L*a*b*、黄度指数、透光率、雾度与耐热稳定性。',
      caution: '先确认客户是需要中和黄色还是提高白度，两者配方逻辑不同。',
      pitch: 'This grade is designed to neutralize the yellow tone in PET and recycled PET. It improves visual brightness at a low dosage without significantly affecting transparency.'
    },
    {
      id: 'tough', type: 'masterbatch', image: 'assets/masterbatch-lab.jpg',
      zh: 'PET 增韧耐寒母粒', en: 'PET Toughening Masterbatch',
      summary: '改善低温脆裂和边角破损，兼顾加工稳定性与透明产品外观。',
      tags: ['Impact strength', 'Low temperature', 'Clear applications'],
      application: '冷藏包装、折盒、厚片与需要冲击韧性的 PET 制品',
      dosage: '建议 3–8%，以落球、缺口冲击和透明度综合确认。',
      metrics: '冲击强度、断裂伸长率、雾度、熔体稳定性。',
      caution: '增韧与透明度通常需要平衡，必须在客户实际基材上小试。',
      pitch: 'Our PET toughening masterbatch improves impact resistance, especially at low temperatures. The final dosage depends on your target toughness and transparency requirements.'
    },
    {
      id: 'sheet', type: 'liquid', image: 'assets/pet-sheet-lab.jpg',
      zh: 'PET / PETG 片材综合方案', en: 'PET & PETG Sheet Performance Package',
      summary: '围绕清晰度、爽滑、防粘、韧性与热成型表现组合优化。',
      tags: ['Thermoforming', 'Clarity control', 'Custom package'],
      application: '食品托盘、电子吸塑、折盒和装饰片材',
      dosage: '按问题拆分方案，先小试单一变量，再进行组合测试。',
      metrics: '雾度、黄度、COF、冲击、成型窗口和叠片表现。',
      caution: '需要客户提供基材牌号、层结构、设备温度及当前缺陷照片。',
      pitch: 'We provide a tailored PET and PETG sheet solution based on your material grade, layer structure and target performance. The first step is to identify the key issue and run a controlled trial.'
    },
    {
      id: 'liquid', type: 'liquid', image: 'assets/pet-sheet-lab.jpg',
      zh: '进口液体助剂组合', en: 'Imported Liquid Additive Package',
      summary: '适合需要快速分散、低添加量和在线精细调节的加工场景。',
      tags: ['Low dosage', 'Fast dispersion', 'Flexible adjustment'],
      application: '片材、薄膜、回收料改性与连续挤出线',
      dosage: '由有效成分与计量系统决定，需确认泵送和相容性。',
      metrics: '分散、迁移、气味、热稳定性、计量精度。',
      caution: '量产前必须验证液体计量设备、混合位置与长期析出风险。',
      pitch: 'This liquid additive package offers fast dispersion and flexible dosage adjustment. We will first check your dosing system and processing conditions before recommending a trial level.'
    },
    {
      id: 'filament', type: 'printing', image: 'assets/filament-lab.jpg',
      zh: 'PETG 3D 打印线材方案', en: 'PETG 3D Printing Filament Solution',
      summary: '面向高速打印优化流动、线径稳定、层间结合和表面效果。',
      tags: ['High-speed printing', 'Layer adhesion', 'Diameter control'],
      application: 'PETG 透明、哑光、功能型与高速打印线材',
      dosage: '根据目标颜色和功能确定，建议从标准打印参数建立基线。',
      metrics: '线径公差、圆度、拉丝、翘曲、层间结合、打印表面。',
      caution: '先排除干燥、喷嘴温度和挤出波动，再判断配方问题。',
      pitch: 'This PETG solution is optimized for stable diameter, smooth extrusion and strong layer adhesion. We can adjust the formulation for high-speed printing, matte appearance or improved toughness.'
    }
  ];

  var scenarios = [
    {id:'inquiry', icon:'01', title:'首次询盘', level:'基础', name:'James Miller', role:'UK sheet manufacturer · Buyer', first:'Hello. We are looking for an additive to reduce blocking on our APET sheet. Can you help?', hint:'先确认材料牌号、片材用途、当前 COF 或粘连程度，再给产品建议。', replies:['Thanks. We use virgin APET for food trays, and the sheets tend to stick after winding.','Our current thickness is 0.6 millimeters. Could you recommend a starting dosage?','That sounds reasonable. Please send a sample and the technical data sheet.']},
    {id:'sample', icon:'02', title:'样品测试', level:'基础', name:'Maria Santos', role:'Brazil · Technical buyer', first:'We received your sample. What conditions should we use for the first trial?', hint:'给出起始添加量、干燥条件和要记录的指标，并邀请客户分享测试结果。', replies:['We can start at 1.5 percent. Should we change the processing temperature?','Which test data would be most useful for your evaluation?','Understood. We will run the test tomorrow and send you the results.']},
    {id:'quality', icon:'03', title:'质量异议', level:'进阶', name:'David Chen', role:'Singapore · QA manager', first:'The latest batch shows a slightly higher haze than the approved sample.', hint:'先确认批号、测试方法和差异数据；承诺调查步骤，不要立刻归因。', replies:['The batch number is FP261008. The haze increased from 2.1 to 2.8 percent.','We used the same test method and conditioned the samples for 24 hours.','Please send us your investigation result and corrective action by Friday.']},
    {id:'quote', icon:'04', title:'报价谈判', level:'进阶', name:'Ahmed Hassan', role:'UAE · Distributor', first:'Your price is higher than our current supplier. Can you offer a better price?', hint:'先确认预计数量和贸易条款，再用稳定性、添加量或服务解释总成本。', replies:['Our forecast is around 20 tons per quarter, based on CIF Jebel Ali.','Can you support a trial order of two tons at a more competitive price?','Please send your best offer with lead time and payment terms.']},
    {id:'complaint', icon:'05', title:'客诉处理', level:'高级', name:'Anna Schmidt', role:'Germany · Production manager', first:'We found black spots after adding the new masterbatch on line two.', hint:'确认批号、添加量、干燥、换网和停机历史，并提出隔离样品与对照测试。', replies:['The dosage was two percent, and both materials were dried before production.','The black spots appeared after three hours. We still have retained samples.','We can run a control test tomorrow. Please join our video call.']},
    {id:'filament', icon:'06', title:'线材项目', level:'专项', name:'Lucas Martin', role:'France · Filament brand', first:'We need a PETG solution for high-speed printing with less stringing.', hint:'确认打印速度、喷嘴温度、线径公差和目标表面，再讨论配方。', replies:['The target speed is 250 millimeters per second with a 0.4 millimeter nozzle.','We currently print at 245 degrees, but stringing is still obvious.','Please propose a test plan and send enough material for ten spools.']}
  ];

  var roadmap = {
    1: {tag:'WEEKS 01–04', title:'阶段一：建立开口能力', desc:'先把 300 个高频词和 40 个核心句型变成能听懂、能说出的主动语言。', weeks:[['第 1 周','发音与生存表达','元音、连读、数字、日期；完成 1 分钟自我介绍。'],['第 2 周','材料与产品词汇','讲清 PET、PETG、母粒和液体助剂的基本区别。'],['第 3 周','工艺与质量词汇','描述挤出、干燥、雾度、黄度和批次一致性。'],['第 4 周','询盘五问','不看稿完成材料、用途、问题、参数、需求量五项确认。']]},
    2: {tag:'WEEKS 05–08', title:'阶段二：掌握业务场景', desc:'把输入转成场景化输出，能够完成询盘、测试、报价和问题澄清。', weeks:[['第 5 周','客户询盘','用追问确认应用、痛点、基材与设备条件。'],['第 6 周','样品测试','说明添加量、试机条件、评价指标和下一步。'],['第 7 周','产品介绍','使用 Problem–Solution–Evidence–Next step 结构。'],['第 8 周','报价跟进','沟通 MOQ、交期、贸易条款、付款条件和反馈节点。']]},
    3: {tag:'WEEKS 09–12', title:'阶段三：独立实战沟通', desc:'训练临场反应和行业阅读，最终能够主持一次 15 分钟英文客户会议。', weeks:[['第 9 周','质量异议','确认事实、复述问题、说明调查计划并管理预期。'],['第 10 周','技术资料阅读','每周精读 2 份 TDS/SDS，整理关键参数和风险。'],['第 11 周','会议与谈判','练习澄清、打断、总结、报价解释和行动项确认。'],['第 12 周','综合路演','完成产品介绍、客户问答和会后英文跟进邮件。']]}
  };

  function safeText(value) {
    return String(value).replace(/[&<>"']/g, function (char) {
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[char];
    });
  }

  function toast(message) {
    var node = $('#toast');
    node.textContent = message;
    node.classList.add('show');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(function () { node.classList.remove('show'); }, 2400);
  }

  function navigate(view) {
    if (!pageNames[view]) { view = 'dashboard'; }
    state.view = view;
    $$('.view').forEach(function (panel) {
      panel.classList.toggle('active', panel.getAttribute('data-view-panel') === view);
    });
    $$('.nav-item').forEach(function (button) {
      button.classList.toggle('active', button.getAttribute('data-view') === view);
    });
    $('#pageTitle').textContent = pageNames[view];
    if (location.hash !== '#' + view) { history.replaceState(null, '', '#' + view); }
    $('#sidebar').classList.remove('open');
    window.scrollTo({top: 0, behavior: 'smooth'});
  }

  function preferredVoice(lang) {
    var voices = window.speechSynthesis ? speechSynthesis.getVoices() : [];
    var names = lang === 'en-GB'
      ? ['Microsoft Ryan Online', 'Microsoft Sonia Online', 'Google UK English Female', 'Daniel']
      : ['Microsoft Aria Online', 'Microsoft Jenny Online', 'Google US English', 'Samantha'];
    for (var i = 0; i < names.length; i += 1) {
      var named = voices.find(function (voice) { return voice.name.indexOf(names[i]) >= 0; });
      if (named) { return named; }
    }
    return voices.find(function (voice) { return voice.lang === lang; }) ||
      voices.find(function (voice) { return voice.lang.indexOf(lang.slice(0, 2)) === 0; });
  }

  function speak(text, rate) {
    if (!('speechSynthesis' in window)) {
      toast('当前浏览器不支持语音朗读，请使用新版 Edge 或 Chrome。');
      return;
    }
    speechSynthesis.cancel();
    var utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = state.accent;
    utterance.rate = Number(rate || ($('#rateRange') && $('#rateRange').value) || 0.88);
    utterance.pitch = 1;
    var voice = preferredVoice(state.accent);
    if (voice) { utterance.voice = voice; }
    speechSynthesis.speak(utterance);
  }

  function updateMetrics() {
    var savedCount = state.savedWords.length;
    var todayKey = 'fp-missions-' + new Date().toISOString().slice(0, 10);
    var missions = storage.get(todayKey, []);
    var minuteMap = {warmup: 5, words: 8, roleplay: 12, product: 7};
    var minutes = missions.reduce(function (sum, item) { return sum + (minuteMap[item] || 0); }, 0);
    $('#learnedMetric').textContent = savedCount;
    $('#scoreMetric').textContent = state.bestScore || '—';
    $('#bestScore').textContent = state.bestScore || '—';
    $('#minuteMetric').textContent = minutes;
    $('#savedBadge').textContent = savedCount;
    $('#wordProgress').style.width = Math.min(100, savedCount / 120 * 100) + '%';
    $('#scoreProgress').style.width = Math.min(100, state.bestScore) + '%';
    $('#minuteProgress').style.width = Math.min(100, minutes / 32 * 100) + '%';
    $('#levelPercent').textContent = Math.min(99, 18 + Math.floor(savedCount / 3)) + '%';
  }

  function initMissions() {
    var todayKey = 'fp-missions-' + new Date().toISOString().slice(0, 10);
    var selected = storage.get(todayKey, []);
    $$('[data-mission]').forEach(function (input) {
      input.checked = selected.indexOf(input.getAttribute('data-mission')) >= 0;
      input.addEventListener('change', function () {
        selected = $$('[data-mission]:checked').map(function (box) { return box.getAttribute('data-mission'); });
        storage.set(todayKey, selected);
        $('#missionCount').textContent = selected.length + ' / 4';
        updateMetrics();
        if (selected.length === 4) { toast('今日 4 项任务已完成，做得很好。'); }
      });
    });
    $('#missionCount').textContent = selected.length + ' / 4';
  }

  function renderPhraseList() {
    $('#phraseList').innerHTML = phrases.map(function (phrase, index) {
      return '<button class="phrase-item ' + (index === state.phraseIndex ? 'active' : '') + '" data-phrase="' + index + '">' +
        '<span>' + String(index + 1).padStart(2, '0') + '</span><div><b>' + safeText(phrase.text) +
        '</b><small>' + safeText(phrase.cn) + '</small></div></button>';
    }).join('');
    $$('[data-phrase]').forEach(function (button) {
      button.addEventListener('click', function () {
        state.phraseIndex = Number(button.getAttribute('data-phrase'));
        renderPhrase();
      });
    });
  }

  function renderPhrase() {
    var phrase = phrases[state.phraseIndex];
    $('#phraseIndex').textContent = String(state.phraseIndex + 1).padStart(2, '0');
    $('#practicePhrase').textContent = phrase.text;
    $('#practiceIpa').textContent = phrase.ipa;
    $('#practiceCn').textContent = phrase.cn;
    $('#phonemeRow').innerHTML = phrase.phonemes.map(function (item) {
      return '<span class="phoneme-chip">' + safeText(item) + '</span>';
    }).join('');
    $('#scoreResult').hidden = true;
    renderPhraseList();
  }

  function normalizeSpeech(value) {
    return value.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();
  }

  function levenshtein(a, b) {
    var matrix = [];
    var i;
    for (i = 0; i <= b.length; i += 1) { matrix[i] = [i]; }
    for (i = 0; i <= a.length; i += 1) { matrix[0][i] = i; }
    for (i = 1; i <= b.length; i += 1) {
      for (var j = 1; j <= a.length; j += 1) {
        matrix[i][j] = b.charAt(i - 1) === a.charAt(j - 1)
          ? matrix[i - 1][j - 1]
          : Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
      }
    }
    return matrix[b.length][a.length];
  }

  function scoreSpeech(transcript) {
    var target = normalizeSpeech(phrases[state.phraseIndex].text);
    var spoken = normalizeSpeech(transcript);
    var targetWords = target.split(' ');
    var spokenWords = spoken.split(' ');
    var matched = targetWords.filter(function (word) { return spokenWords.indexOf(word) >= 0; });
    var charScore = Math.max(0, 1 - levenshtein(target, spoken) / Math.max(target.length, spoken.length, 1));
    var wordScore = matched.length / targetWords.length;
    var score = Math.round((charScore * 0.62 + wordScore * 0.38) * 100);
    var title = score >= 90 ? '非常清晰' : score >= 75 ? '表达不错' : score >= 58 ? '已经听得懂' : '再慢一点试试';
    $('#scoreNumber').textContent = score;
    $('#scoreTitle').textContent = title;
    $('#scoreFeedback').textContent = '识别结果：' + (transcript || '未识别到内容') + '。' + phrases[state.phraseIndex].tip;
    $('#wordFeedback').innerHTML = targetWords.map(function (word) {
      return '<span class="' + (spokenWords.indexOf(word) >= 0 ? 'good' : 'retry') + '">' + word + '</span>';
    }).join('');
    $('#scoreResult').hidden = false;
    if (score > state.bestScore) {
      state.bestScore = score;
      storage.set('fp-best-score', score);
      updateMetrics();
      toast('新的最佳发音：' + score + ' 分');
    }
  }

  function startRecognition(targetInput, onResult) {
    var Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) {
      toast('当前浏览器不支持语音识别，请使用新版 Edge 或 Chrome。');
      return null;
    }
    var recognition = new Recognition();
    recognition.lang = state.accent;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = function (event) {
      var transcript = event.results[0][0].transcript;
      if (targetInput) { targetInput.value = transcript; }
      if (onResult) { onResult(transcript); }
    };
    recognition.onerror = function (event) {
      var messages = {
        'not-allowed': '请允许浏览器使用麦克风后再试。',
        'no-speech': '没有听到声音，请靠近麦克风再试。',
        'network': '语音识别服务暂时不可用，请稍后再试。'
      };
      toast(messages[event.error] || '没有识别成功，请再试一次。');
    };
    recognition.start();
    return recognition;
  }

  function initPronunciation() {
    $('#waveform').innerHTML = new Array(25).join('<i></i>');
    renderPhrase();
    $('#listenSlow').addEventListener('click', function () { speak(phrases[state.phraseIndex].text, 0.65); });
    $('#listenNormal').addEventListener('click', function () { speak(phrases[state.phraseIndex].text, $('#rateRange').value); });
    $('#rateRange').addEventListener('input', function () {
      $('#rateLabel').textContent = Number(this.value).toFixed(2) + '×';
    });
    $$('#accentSwitch button').forEach(function (button) {
      button.classList.toggle('active', button.getAttribute('data-accent') === state.accent);
      button.addEventListener('click', function () {
        state.accent = button.getAttribute('data-accent');
        storage.set('fp-accent', state.accent);
        $$('#accentSwitch button').forEach(function (item) { item.classList.toggle('active', item === button); });
        toast(state.accent === 'en-US' ? '已切换为美式发音' : '已切换为英式发音');
      });
    });
    $('#recordBtn').addEventListener('click', function () {
      var button = this;
      button.classList.add('recording');
      button.querySelector('b').textContent = '正在聆听';
      $('#waveform').classList.add('active');
      var recognition = startRecognition(null, scoreSpeech);
      if (!recognition) {
        button.classList.remove('recording');
        button.querySelector('b').textContent = '开始跟读';
        $('#waveform').classList.remove('active');
        return;
      }
      recognition.onend = function () {
        button.classList.remove('recording');
        button.querySelector('b').textContent = '开始跟读';
        $('#waveform').classList.remove('active');
      };
    });
  }

  function renderCategories() {
    var counts = vocabulary.reduce(function (result, item) {
      result[item.cat] = (result[item.cat] || 0) + 1;
      return result;
    }, {});
    $('#categoryChips').innerHTML = Object.keys(categoryNames).map(function (key) {
      var count = key === 'all' ? vocabulary.length : counts[key];
      return '<button class="' + (state.category === key ? 'active' : '') + '" data-category="' + key + '">' +
        categoryNames[key] + '<span>' + count + '</span></button>';
    }).join('');
    $$('[data-category]').forEach(function (button) {
      button.addEventListener('click', function () {
        state.category = button.getAttribute('data-category');
        state.wordLimit = 24;
        renderCategories();
        renderWords();
      });
    });
  }

  function currentWords() {
    var rawQuery = $('#wordSearch').value.trim();
    var query = normalizeSpeech(rawQuery);
    return vocabulary.filter(function (item) {
      var categoryMatch = state.category === 'all' || item.cat === state.category;
      var saveMatch = !state.savedOnly || state.savedWords.indexOf(item.id) >= 0;
      var haystack = normalizeSpeech(item.word + ' ' + item.example);
      return categoryMatch && saveMatch && (!rawQuery || haystack.indexOf(query) >= 0 || item.zh.indexOf(rawQuery) >= 0);
    });
  }

  function renderWords() {
    var filtered = currentWords();
    var visible = filtered.slice(0, state.wordLimit);
    $('#wordResultCount').textContent = filtered.length + ' 个词';
    $('#wordRows').innerHTML = visible.length ? visible.map(function (item) {
      var saved = state.savedWords.indexOf(item.id) >= 0;
      return '<article class="word-row">' +
        '<button class="word-main sound-btn-inline" data-word-speak="' + safeText(item.word) + '"><b>' + safeText(item.word) +
        '</b><small>' + safeText(item.ipa) + '</small><em>' + categoryNames[item.cat] + '</em></button>' +
        '<div class="word-meaning">' + safeText(item.zh) + '</div>' +
        '<button class="word-example sound-btn-inline" data-example-speak="' + safeText(item.example) + '">' + safeText(item.example) + '<span>▶</span></button>' +
        '<button class="save-word ' + (saved ? 'saved' : '') + '" data-save-word="' + item.id + '" aria-label="收藏 ' + safeText(item.word) + '">' + (saved ? '★' : '☆') + '</button>' +
        '</article>';
    }).join('') : '<div class="empty-state"><b>没有找到匹配词汇</b><p>换一个关键词或清除筛选试试。</p></div>';
    $('#loadMoreBtn').hidden = visible.length >= filtered.length;
    $$('[data-word-speak]').forEach(function (button) {
      button.addEventListener('click', function () { speak(button.getAttribute('data-word-speak'), 0.78); });
    });
    $$('[data-example-speak]').forEach(function (button) {
      button.addEventListener('click', function () { speak(button.getAttribute('data-example-speak'), 0.86); });
    });
    $$('[data-save-word]').forEach(function (button) {
      button.addEventListener('click', function () {
        var id = Number(button.getAttribute('data-save-word'));
        var index = state.savedWords.indexOf(id);
        if (index >= 0) { state.savedWords.splice(index, 1); }
        else { state.savedWords.push(id); }
        storage.set('fp-saved-words', state.savedWords);
        renderWords();
        updateMetrics();
      });
    });
  }

  function initVocabulary() {
    $('#totalWords').textContent = vocabulary.length;
    renderCategories();
    renderWords();
    $('#wordSearch').addEventListener('input', function () {
      state.wordLimit = 24;
      renderWords();
    });
    $('#savedOnlyBtn').addEventListener('click', function () {
      state.savedOnly = !state.savedOnly;
      this.classList.toggle('active', state.savedOnly);
      this.textContent = state.savedOnly ? '显示全部单词' : '只看已收藏';
      state.wordLimit = 24;
      renderWords();
    });
    $('#loadMoreBtn').addEventListener('click', function () {
      state.wordLimit += 24;
      renderWords();
    });
  }

  function renderProducts() {
    var list = products.filter(function (item) { return state.productFilter === 'all' || item.type === state.productFilter; });
    $('#productGrid').innerHTML = list.map(function (product) {
      return '<article class="product-card">' +
        '<img src="' + product.image + '" alt="' + safeText(product.zh) + '产品应用场景">' +
        '<div class="product-card-body"><small>' + safeText(product.en) + '</small><h2>' + safeText(product.zh) + '</h2><p>' +
        safeText(product.summary) + '</p><div class="product-tags">' + product.tags.map(function (tag) { return '<span>' + safeText(tag) + '</span>'; }).join('') +
        '</div><button class="product-open" data-product="' + product.id + '">查看产品话术 <span>→</span></button></div></article>';
    }).join('');
    $$('[data-product]').forEach(function (button) {
      button.addEventListener('click', function () { openProduct(button.getAttribute('data-product')); });
    });
  }

  function openProduct(id) {
    var product = products.find(function (item) { return item.id === id; });
    if (!product) { return; }
    $('#modalContent').innerHTML =
      '<div class="modal-hero"><img src="' + product.image + '" alt="' + safeText(product.zh) + '"></div>' +
      '<div class="modal-copy"><p class="kicker">' + safeText(product.en) + '</p><h2>' + safeText(product.zh) + '</h2><p>' + safeText(product.summary) + '</p>' +
      '<div class="product-detail-grid"><div class="detail-block"><b>典型应用</b><p>' + safeText(product.application) + '</p></div>' +
      '<div class="detail-block"><b>建议用量</b><p>' + safeText(product.dosage) + '</p></div><div class="detail-block"><b>验证指标</b><p>' +
      safeText(product.metrics) + '</p></div><div class="detail-block"><b>沟通提醒</b><p>' + safeText(product.caution) + '</p></div></div>' +
      '<div class="pitch-box"><span>READY-TO-USE PITCH</span><h3>可直接使用的产品介绍</h3><p>' +
      safeText(product.pitch) + '</p><button class="sound-btn solid" id="speakPitch">朗读产品话术</button></div></div>';
    $('#productModal').hidden = false;
    document.body.classList.add('modal-open');
    $('#speakPitch').addEventListener('click', function () { speak(product.pitch, 0.84); });
  }

  function closeProduct() {
    $('#productModal').hidden = true;
    document.body.classList.remove('modal-open');
    if ('speechSynthesis' in window) { speechSynthesis.cancel(); }
  }

  function initProducts() {
    renderProducts();
    $$('#productFilter button').forEach(function (button) {
      button.addEventListener('click', function () {
        state.productFilter = button.getAttribute('data-product-filter');
        $$('#productFilter button').forEach(function (item) { item.classList.toggle('active', item === button); });
        renderProducts();
      });
    });
    $$('[data-close-modal]').forEach(function (button) { button.addEventListener('click', closeProduct); });
  }

  function appendMessage(role, text) {
    var message = document.createElement('div');
    message.className = 'bubble ' + role;
    var label = document.createElement('span');
    label.textContent = role === 'client' ? 'CLIENT' : 'YOU';
    var paragraph = document.createElement('p');
    paragraph.textContent = text;
    message.appendChild(label);
    message.appendChild(paragraph);
    $('#chatMessages').appendChild(message);
    $('#chatMessages').scrollTop = $('#chatMessages').scrollHeight;
  }

  function renderScenarios() {
    $('#scenarioList').innerHTML = '<div class="scenario-label">SCENARIOS</div>' + scenarios.map(function (scene) {
      return '<button class="scenario-button ' + (scene.id === state.scene ? 'active' : '') + '" data-scene="' + scene.id + '">' +
        '<span>' + scene.icon + '</span><div><b>' + scene.title + '</b><small>' + scene.level + '</small></div></button>';
    }).join('');
    $$('[data-scene]').forEach(function (button) {
      button.addEventListener('click', function () { selectScene(button.getAttribute('data-scene')); });
    });
  }

  function selectScene(id) {
    var scene = scenarios.find(function (item) { return item.id === id; }) || scenarios[0];
    state.scene = scene.id;
    state.sceneStep = 0;
    renderScenarios();
    $('#clientName').textContent = scene.name;
    $('#clientRole').textContent = scene.role;
    $('#coachHint').textContent = scene.hint;
    $('#chatMessages').innerHTML = '';
    appendMessage('client', scene.first);
    state.lastClientLine = scene.first;
  }

  function coachFeedback(text) {
    var normalized = normalizeSpeech(text);
    var notes = [];
    if (!/\b(could|would|may|please|thanks|thank)\b/.test(normalized)) { notes.push('加一个礼貌开头'); }
    if (text.indexOf('?') < 0 && !/\b(confirm|share|tell|know|provide)\b/.test(normalized)) { notes.push('补一个澄清问题'); }
    if (!/\b(sample|trial|test|data|result|follow|send|confirm|check)\b/.test(normalized)) { notes.push('说清下一步行动'); }
    return notes.length ? '表达已经能推进对话。下一轮可以：' + notes.join('、') + '。' : '很好：语气礼貌、信息具体，而且给出了下一步。';
  }

  function initConversation() {
    renderScenarios();
    selectScene(state.scene);
    $('#chatForm').addEventListener('submit', function (event) {
      event.preventDefault();
      var input = $('#chatInput');
      var text = input.value.trim();
      if (!text) { return; }
      appendMessage('user', text);
      input.value = '';
      $('#coachHint').textContent = coachFeedback(text);
      var scene = scenarios.find(function (item) { return item.id === state.scene; });
      var reply = scene.replies[Math.min(state.sceneStep, scene.replies.length - 1)];
      state.sceneStep += 1;
      setTimeout(function () {
        appendMessage('client', reply);
        state.lastClientLine = reply;
      }, 480);
    });
    $('#chatMic').addEventListener('click', function () {
      var input = $('#chatInput');
      var button = this;
      button.classList.add('active');
      var recognition = startRecognition(input, function () { input.focus(); });
      if (recognition) { recognition.onend = function () { button.classList.remove('active'); }; }
      else { button.classList.remove('active'); }
    });
    $('#replayClient').addEventListener('click', function () { speak(state.lastClientLine, 0.86); });
  }

  function renderRoadmap() {
    var phase = roadmap[state.phase];
    $('#roadmapBody').innerHTML =
      '<div class="roadmap-intro"><span>' + phase.tag + '</span><div><h2>' + phase.title + '</h2><p>' + phase.desc + '</p></div></div>' +
      '<div class="week-list">' + phase.weeks.map(function (week, index) {
        return '<article class="week-card"><span>' + String((state.phase - 1) * 4 + index + 1).padStart(2, '0') +
          '</span><div><small>' + week[0] + '</small><h3>' + week[1] + '</h3><p>' + week[2] + '</p></div></article>';
      }).join('') + '</div>';
  }

  function initRoadmap() {
    renderRoadmap();
    $$('#phaseSwitch button').forEach(function (button) {
      button.addEventListener('click', function () {
        state.phase = Number(button.getAttribute('data-phase'));
        $$('#phaseSwitch button').forEach(function (item) { item.classList.toggle('active', item === button); });
        renderRoadmap();
      });
    });
  }

  function initNavigation() {
    $$('.nav-item').forEach(function (button) {
      button.addEventListener('click', function () { navigate(button.getAttribute('data-view')); });
    });
    $$('[data-jump]').forEach(function (button) {
      button.addEventListener('click', function () {
        var scene = button.getAttribute('data-scene-target');
        if (scene) { selectScene(scene); }
        navigate(button.getAttribute('data-jump'));
      });
    });
    $('.brand').addEventListener('click', function (event) {
      event.preventDefault();
      navigate('dashboard');
    });
    $('#menuBtn').addEventListener('click', function () { $('#sidebar').classList.toggle('open'); });
    window.addEventListener('hashchange', function () {
      var view = location.hash.replace('#', '');
      if (view !== state.view && pageNames[view]) { navigate(view); }
    });
  }

  function init() {
    $('#todayDate').textContent = new Intl.DateTimeFormat('zh-CN', {month: 'long', day: 'numeric'}).format(new Date());
    $('#streakCount').textContent = storage.get('fp-streak', 1);
    initNavigation();
    initMissions();
    initPronunciation();
    initVocabulary();
    initProducts();
    initConversation();
    initRoadmap();
    updateMetrics();
    $$('.sound-btn').forEach(function (button) {
      if (button.id) { return; }
      button.addEventListener('click', function () {
        speak(button.getAttribute('data-speak'), button.getAttribute('data-rate'));
      });
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && !$('#productModal').hidden) { closeProduct(); }
    });
    var initial = location.hash.replace('#', '');
    navigate(pageNames[initial] ? initial : 'dashboard');
    if ('speechSynthesis' in window) {
      speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = function () { speechSynthesis.getVoices(); };
    }
  }

  document.addEventListener('DOMContentLoaded', init);
}());

