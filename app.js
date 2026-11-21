(() => {
  const $ = (id) => document.getElementById(id);
  const welcome=$("welcome"), chatView=$("chatView"), messages=$("messages"), question=$("question");
  let conversations=[], activeId=null, storageOK=true;
  const now=()=>new Date().toISOString();
  const makeId=()=>`c_${Date.now()}_${Math.random().toString(36).slice(2,7)}`;
  function load(){
    try{const raw=localStorage.getItem("govai_conversations_v13");conversations=raw?JSON.parse(raw):[];if(!Array.isArray(conversations))conversations=[];}
    catch(e){storageOK=false;conversations=[];}
  }
  function save(){
    try{localStorage.setItem("govai_conversations_v13",JSON.stringify(conversations));storageOK=true;}
    catch(e){storageOK=false;}
  }
  function active(){return conversations.find(c=>c.id===activeId)||null;}
  function escapeHTML(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
  function renderHistory(){
    const host=$("historyList");host.innerHTML="";
    if(!conversations.length){host.innerHTML='<p class="muted side-empty">Your conversations will appear here.</p>';return;}
    [...conversations].sort((a,b)=>b.updated.localeCompare(a.updated)).forEach(c=>{
      const b=document.createElement("button");b.className="history-item";b.textContent=c.title||"New conversation";b.onclick=()=>openConversation(c.id);host.appendChild(b);
    });
  }
  function renderMessages(){
    const c=active();messages.innerHTML="";
    if(!c||!c.messages.length)return;
    c.messages.forEach(m=>{
      const row=document.createElement("div");row.className=`message ${m.role}`;
      row.innerHTML=`<div class="avatar">${m.role==="user"?"Y":"G"}</div><div class="bubble">${escapeHTML(m.text)}</div>`;
      messages.appendChild(row);
    });
    chatView.scrollTop=chatView.scrollHeight;
  }
  function showChat(){welcome.classList.add("hidden");chatView.classList.remove("hidden");$("suggestions").classList.add("hidden");}
  function openConversation(id){activeId=id;showChat();renderMessages();closeSidebar();}
  function newChat(){
    activeId=null;messages.innerHTML="";chatView.classList.add("hidden");welcome.classList.remove("hidden");
    question.value="";$("suggestions").classList.add("hidden");closeSidebar();
  }
  function addMessage(role,text){
    let c=active();
    if(!c){c={id:makeId(),title:role==="user"?text.slice(0,42):"New conversation",created:now(),updated:now(),messages:[]};conversations.push(c);activeId=c.id;}
    if(role==="user"&&c.messages.length===0)c.title=text.replace(/\s+/g," ").slice(0,42);
    c.messages.push({role,text,at:now()});c.updated=now();save();renderHistory();renderMessages();
  }
  function answer(text){
    const t=text.toLowerCase();
    if(/pacra|register.*(business|company|name)|business name|limited company/.test(t))return pacraAnswer(t);
    if(/zra|tpin|tax|taxpayer/.test(t))return zraAnswer();
    if(/business plan|startup|starter|budget|business profile/.test(t))return starterAnswer();
    if(/more services|service directory|government services/.test(t))return directoryAnswer();
    return "I can help you prepare for selected services and business tasks in this prototype.\n\nYou can ask about:\n• PACRA business-name or company-registration preparation\n• ZRA TPIN and tax guidance\n• A business plan, profile or startup budget\n\nChoose one of these topics or describe what you are trying to do. I will explain each step in plain language.";
  }
  function pacraAnswer(t){
    const isName=/business name|name reservation|sole trader|trade name/.test(t)&&!/limited company|company registration/.test(t);
    if(isName)return "PACRA – BUSINESS NAME REGISTRATION\n\nA business name is commonly used by a sole trader or partnership. It is not the same as registering a limited company.\n\nTo prepare, gather:\n1. Your proposed business name(s).\n2. Nature of business and business activities.\n3. Owner/partner details and contact information.\n4. Identification and any supporting information PACRA currently requires.\n\nNext step: tell me your proposed business name and what the business will do. I can help you prepare a checklist and draft details for review.\n\nImportant: This prototype does not check name availability or submit an application to PACRA.";
    return "PACRA – LIMITED COMPANY REGISTRATION\n\nA limited company is a separate legal entity. This route is different from registering a business name.\n\nPreparation checklist:\n1. Proposed company name(s).\n2. Company type and principal business activity.\n3. Details of shareholders and directors.\n4. Share structure and registered office details.\n5. Identification and supporting information required by PACRA.\n\nPlain language: shareholders own the company; directors are responsible for managing it. One person may sometimes hold more than one role, subject to applicable rules.\n\nTell me the proposed company name and business activity and I can help organise a preparation checklist.\n\nImportant: GOVAI does not check availability, file documents or obtain official approval from PACRA.";
  }
  function zraAnswer(){return "ZRA – TPIN AND TAX PREPARATION\n\nA TPIN is a Taxpayer Identification Number used by the Zambia Revenue Authority to identify a taxpayer.\n\nTo prepare, you may need:\n1. Your identity or business registration details.\n2. Contact information and physical/business address.\n3. Relevant PACRA documents if registering a company or business.\n4. Details of the type of taxpayer or business activity.\n\nI can help you understand the information and prepare a checklist. Tell me whether you need a TPIN as an individual, sole trader or registered company.\n\nImportant: GOVAI is not connected to ZRA and cannot issue a TPIN, access taxpayer records or submit a tax registration.";
  }
  function starterAnswer(){return "BUSINESS STARTER PACK\n\nI can help prepare these documents:\n• Business profile – what the business does, who it serves and how to contact it.\n• Business plan – objectives, customers, operations, marketing and financial assumptions.\n• Startup budget – estimated setup costs and monthly expenses.\n• Simple cash-flow forecast – expected money coming in and going out.\n\nTo begin, tell me the business idea, where it will operate and whether you are starting from scratch or already trading. I will build the document with you in plain language.\n\nAny figures produced are planning estimates, not guaranteed results or professional accounting advice.";
  }
  function directoryAnswer(){return "GOVERNMENT SERVICES DIRECTORY\n\nAvailable in this prototype:\n• PACRA – business registration preparation\n• ZRA – TPIN and tax guidance\n• Business Starter Pack – plans, profiles and budgets\n\nComing soon (not yet operational):\n• NRC and civil registration\n• Passports and immigration\n• Land and property\n• RTSA and road transport\n• Education and bursaries\n• Health services\n• Agriculture and livestock\n• Mining and minerals\n• Employment and labour\n• NAPSA and social security\n• Local government and council services\n• Public procurement\n• Justice and court information\n• Tourism and environment\n\nThese directory entries are placeholders. They do not imply an integration or official relationship.";
  }
  function wizardIntent(t){
    t=t.toLowerCase();if(/understand|explain|what is|how do|how to|difference/.test(t))return null;
    if(/\b(register|apply|get|start|set up)\b.*\btpin\b|\btpin registration\b/.test(t))return "tpin";
    if(/\bregister (a |my |the )?(new )?business( name)?\b/.test(t)&&!/limited company/.test(t))return "business";
    if(/\b(create|make|build|write|start)\b.*\bbusiness profile\b/.test(t))return "profile";
    return null;
  }
  function startWizard(key){
    if(!window.GOVAIWizard)return;
    closeSidebar();
    GOVAIWizard.start(key,{onComplete:(flow,r)=>{addMessage("user",`Guided demo: ${flow.title}`);addMessage("assistant",r.text);showChat();}});
  }
  function send(text){
    const value=(text??question.value).trim();if(!value)return;
    const wz=wizardIntent(value);
    if(wz){question.value="";resizeInput();startWizard(wz);return;}
    addMessage("user",value);question.value="";resizeInput();showChat();
    const reply=answer(value);addMessage("assistant",reply);
    $("suggestions").classList.add("hidden");
  }
  function resizeInput(){question.style.height="auto";question.style.height=Math.min(question.scrollHeight,130)+"px";}
  function openSidebar(){$("sidebar").classList.add("open");$("scrim").classList.add("show");}
  function closeSidebar(){$("sidebar").classList.remove("open");$("scrim").classList.remove("show");}
  $("composer").addEventListener("submit",e=>{e.preventDefault();send();});
  question.addEventListener("input",()=>{$("suggestions").classList.toggle("hidden",question.value.length>0);resizeInput();});
  question.addEventListener("focus",()=>{if(!question.value.trim()&&welcome.classList.contains("hidden")===false)$("suggestions").classList.remove("hidden");});
  $("suggestions").addEventListener("click",e=>{const b=e.target.closest("[data-prompt]");if(b)send(b.dataset.prompt);});
  $("menuBtn").onclick=openSidebar;$("closeSidebar").onclick=closeSidebar;$("scrim").onclick=closeSidebar;
  $("newChatBtn").onclick=newChat;$("newChatTop").onclick=newChat;
  $("serviceNav").addEventListener("click",e=>{const b=e.target.closest("[data-service]");if(!b)return;const key=b.dataset.service;const prompts={pacra:"I want to register a business name or limited company with PACRA. Explain the two options.",zra:"Help me understand ZRA TPIN and tax registration.",starter:"Help me create a business plan and startup budget.",directory:"Show me the government services directory."};send(prompts[key]);closeSidebar();});
  document.addEventListener("click",e=>{const b=e.target.closest("[data-wizard]");if(b)startWizard(b.dataset.wizard);});
  document.addEventListener("keydown",e=>{if(e.key==="Escape")closeSidebar();});
  /* Voice input for the chat box: speak a question or say "register a TPIN" */
  (()=>{
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition,mic=$("micBtn");if(!SR)return;
    mic.classList.remove("hidden");let r=null,on=false;
    mic.onclick=()=>{
      if(on){try{r.stop();}catch(e){}return;}
      r=new SR();r.lang="en-GB";r.interimResults=true;r.continuous=false;
      r.onstart=()=>{on=true;mic.classList.add("on");};
      r.onresult=ev=>{let t="";for(const x of ev.results)t+=x[0].transcript;question.value=t;resizeInput();};
      r.onerror=()=>{};
      r.onend=()=>{on=false;mic.classList.remove("on");if(question.value.trim())send();};
      try{r.start();}catch(e){}
    };
  })();
  load();renderHistory();newChat();
  if("serviceWorker" in navigator && location.protocol.startsWith("http"))window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
  if(!storageOK)console.warn("GOVAI could not access local storage; conversation history may not persist.");
})();