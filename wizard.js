/* GOVAI guided demos: 10-step forms with voice commands, read-out and demo result pages.
   Demo only. Nothing is sent anywhere and no real registration, TPIN or profile is issued. */
(() => {
  "use strict";
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const TTS = "speechSynthesis" in window;
  const PROVINCES = ["Central","Copperbelt","Eastern","Luapula","Lusaka","Muchinga","Northern","North-Western","Southern","Western"];
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const rnd = (n) => Array.from({length:n}, () => Math.floor(Math.random()*10)).join("");
  const spaced = (s) => String(s).replace(/\D/g, "").split("").join(" ");
  const today = () => new Date().toLocaleDateString("en-GB", {day:"numeric", month:"long", year:"numeric"});
  const longDate = (iso) => { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso); if (!m) return iso; return new Date(+m[1], +m[2]-1, +m[3]).toLocaleDateString("en-GB", {day:"numeric", month:"long", year:"numeric"}); };

  /* ---------- The three flows (10 short questions each) ---------- */
  const FLOWS = {
    business: {
      key: "business", icon: "🏢", title: "Register a business",
      intro: "Answer 10 short questions. At the end you get a demo business-name registration page.",
      steps: [
        {k:"name", label:"Business name", q:"What is your business name?", ph:"e.g. Mwila Fresh Foods", fmt:"title"},
        {k:"alt", label:"Backup name", q:"Give a backup name.", hint:"Used if your first choice is taken.", ph:"e.g. Mwila Greens", fmt:"title"},
        {k:"type", label:"Type", q:"What type of business is it?", opts:["Sole trader","Partnership","Limited company"], alias:{"Sole trader":["sole","single","alone","individual"],"Partnership":["partner","partners"],"Limited company":["limited","company","ltd"]}},
        {k:"activity", label:"Activity", q:"What will the business do?", ph:"e.g. Sell fresh vegetables"},
        {k:"owner", label:"Owner", q:"What is the owner's full name?", ph:"First and last name", fmt:"title"},
        {k:"nrc", label:"NRC", q:"What is the owner's NRC number?", ph:"123456/78/1", fmt:"nrc", inputmode:"numeric"},
        {k:"phone", label:"Phone", q:"What is your phone number?", ph:"0977 123 456", fmt:"tel", type:"tel"},
        {k:"email", label:"Email", q:"What is your email address?", ph:"name@example.com", fmt:"email", type:"email"},
        {k:"province", label:"Province", q:"Which province is the business in?", opts:PROVINCES},
        {k:"address", label:"Address", q:"What is the business address?", ph:"Plot, street, town"}
      ],
      build(d) {
        const no = `BN-${new Date().getFullYear()}-${rnd(6)}`;
        return {
          badge: "Business name registered", head: "Your business name is created", main: d.name,
          id: {label: "Registration no.", value: no},
          rows: [["Type", d.type], ["Business activity", d.activity], ["Owner", d.owner], ["NRC", d.nrc], ["Phone", d.phone], ["Email", d.email], ["Province", d.province], ["Address", d.address], ["Backup name", d.alt], ["Date registered", today()], ["Status", "Active (demo)"]],
          fine: "Demo only. This is not a real PACRA registration. To register for real, apply through PACRA.",
          speak: [`Congratulations. Your business name, ${d.name}, is created.`, `Registration number, B N ${spaced(no)}.`, `Type: ${d.type}. Owner: ${d.owner}.`, "This is a demo. It is not a real PACRA registration."]
        };
      }
    },
    tpin: {
      key: "tpin", icon: "🧾", title: "Register a TPIN",
      intro: "Answer 10 short questions. At the end you get a demo TPIN page.",
      steps: [
        {k:"type", label:"Taxpayer type", q:"Who is the TPIN for?", opts:["Individual","Sole trader","Company"], alias:{"Individual":["myself","me","person","personal"],"Sole trader":["sole","trader"],"Company":["business","firm","limited"]}},
        {k:"name", label:"Name", q:"What is the full name or company name?", ph:"Full name", fmt:"title"},
        {k:"nrc", label:"NRC", q:"What is your NRC number?", hint:"For a company, use a director's NRC.", ph:"123456/78/1", fmt:"nrc", inputmode:"numeric"},
        {k:"dob", label:"Date of birth", q:"What is your date of birth?", hint:"For a company, use the owner's date of birth. Say it like “5 March 1990”.", fmt:"date", type:"date"},
        {k:"phone", label:"Phone", q:"What is your phone number?", ph:"0977 123 456", fmt:"tel", type:"tel"},
        {k:"email", label:"Email", q:"What is your email address?", ph:"name@example.com", fmt:"email", type:"email"},
        {k:"province", label:"Province", q:"Which province do you live in?", opts:PROVINCES},
        {k:"address", label:"Address", q:"What is your physical address?", ph:"Plot, street, town"},
        {k:"income", label:"Main income", q:"What is your main source of income?", opts:["Employment","Business","Farming","Rent","Other"], alias:{"Employment":["job","salary","employed","work"],"Business":["trading","self employed"],"Farming":["farm","agriculture"],"Rent":["rental","property"]}},
        {k:"pacra", label:"PACRA no.", q:"Do you have a PACRA number?", hint:"Skip this if you do not have one.", ph:"Type it here, or skip", req:false}
      ],
      build(d) {
        const raw = "10" + rnd(8), tpin = `${raw.slice(0,4)} ${raw.slice(4,7)} ${raw.slice(7)}`;
        return {
          badge: "TPIN issued", head: "Your TPIN is created", main: tpin,
          tagline: "Taxpayer Identification Number",
          rows: [["Taxpayer", d.name], ["Taxpayer type", d.type], ["NRC", d.nrc], ["Date of birth", d.dob], ["Main income", d.income], ["Phone", d.phone], ["Email", d.email], ["Province", d.province], ["Address", d.address], ["PACRA no.", d.pacra], ["Date issued", today()], ["Status", "Active (demo)"]],
          fine: "Demo only. This number is made up. It is not a real ZRA TPIN. Do not use it for any official purpose.",
          speak: [`Congratulations ${d.name}. Your T P I N is created.`, `Your T P I N is ${spaced(raw)}.`, `Taxpayer type: ${d.type}.`, "This is a demo. It is not a real Z R A T P I N."]
        };
      }
    },
    profile: {
      key: "profile", icon: "📋", title: "Create a business profile",
      intro: "Answer 10 short questions. At the end you get a demo business profile page.",
      steps: [
        {k:"name", label:"Business name", q:"What is your business name?", ph:"e.g. Mwila Fresh Foods", fmt:"title"},
        {k:"what", label:"What it does", q:"What does your business do?", hint:"One short sentence.", ph:"e.g. Sells fresh vegetables"},
        {k:"industry", label:"Industry", q:"Which industry is it in?", opts:["Retail","Food & drink","Agriculture","Services","Manufacturing","Technology","Transport","Other"], alias:{"Retail":["shop","shopping","selling"],"Food & drink":["food","restaurant","drink","drinks"],"Agriculture":["farming","farm","agri"],"Technology":["tech","software"]}},
        {k:"customers", label:"Customers", q:"Who are your customers?", ph:"e.g. Families and local shops"},
        {k:"town", label:"Town", q:"Which town or city are you in?", ph:"e.g. Kitwe", fmt:"title"},
        {k:"team", label:"Team size", q:"How many people work there?", opts:["Just me","Small (2–5)","Medium (6–20)","Large (21+)"], alias:{"Just me":["alone","myself","only me","one"],"Small (2–5)":["small","2 to 5","two to five"],"Medium (6–20)":["medium","6 to 20","six to twenty"],"Large (21+)":["large","big","21 or more","more than twenty"]}},
        {k:"stage", label:"Stage", q:"What stage are you at?", opts:["Idea","Just started","Already trading"], alias:{"Idea":["planning","thinking"],"Just started":["started","new","beginning"],"Already trading":["trading","running","operating","established"]}},
        {k:"capital", label:"Startup capital", q:"How much startup money do you have, in kwacha?", ph:"e.g. 20000", fmt:"num", inputmode:"numeric"},
        {k:"goal", label:"12-month goal", q:"What is your main goal for the next 12 months?", ph:"e.g. Open a second shop"},
        {k:"contact", label:"Contact", q:"What is the best phone number or email?", ph:"0977 123 456 or name@example.com", fmt:"contact"}
      ].slice(0, 10),
      build(d) {
        const summary = `${d.name} is a ${String(d.industry).toLowerCase()} business in ${d.town}. It ${lowerFirst(d.what)}. Its customers are ${lowerFirst(d.customers)}.`;
        return {
          badge: "Business profile created", head: "Your business profile is created", main: d.name,
          tagline: `${d.industry} · ${d.town}`, summary,
          rows: [["What it does", d.what], ["Industry", d.industry], ["Customers", d.customers], ["Location", d.town], ["Team size", d.team], ["Stage", d.stage], ["Startup capital", d.capital], ["12-month goal", d.goal], ["Contact", d.contact], ["Created", today()]],
          fine: "Demo only. This profile is saved on this device only. It is a planning document, not an official record.",
          speak: [`Done. Your business profile for ${d.name} is created.`, summary, `Stage: ${d.stage}. Goal: ${d.goal}.`, "This is a demo profile."]
        };
      }
    }
  };
  function lowerFirst(s) { s = String(s || "").trim(); return s ? s.charAt(0).toLowerCase() + s.slice(1).replace(/\.$/, "") : s; }

  /* ---------- Value helpers ---------- */
  const NUM = {zero:0, oh:0, one:1, two:2, three:3, four:4, five:5, six:6, seven:7, eight:8, nine:9};
  const digitsOf = (t) => String(t).toLowerCase().replace(/\b(zero|oh|one|two|three|four|five|six|seven|eight|nine)\b/g, (m) => NUM[m]).replace(/\D/g, "");
  const nz = (x) => String(x).toLowerCase().replace(/[^a-z0-9]/g, "");
  function fmtPhone(raw) {
    const plus = /^\s*(\+|plus)/i.test(raw), d = digitsOf(raw);
    if (plus && d.startsWith("260") && d.length === 12) return `+260 ${d.slice(3,6)} ${d.slice(6,9)} ${d.slice(9)}`;
    if (!plus && /^0\d{9}$/.test(d)) return `${d.slice(0,4)} ${d.slice(4,7)} ${d.slice(7)}`;
    return (plus ? "+" : "") + d;
  }
  function fmtEmail(raw) {
    let t = String(raw).trim().toLowerCase();
    if (!t.includes("@")) t = t.replace(/\s+at\s+/g, "@").replace(/\s+dot\s+/g, ".").replace(/\s+underscore\s+/g, "_").replace(/\s+(dash|hyphen)\s+/g, "-");
    return t.replace(/\s+/g, "");
  }
  const ORD = ["first","second","third","fourth","fifth","sixth","seventh","eighth","ninth","tenth","eleventh","twelfth","thirteenth","fourteenth","fifteenth","sixteenth","seventeenth","eighteenth","nineteenth"];
  function ordinalWords(t) {
    let x = String(t).toLowerCase();
    x = x.replace(/\b(twenty|thirty)[\s-](first|second|third|fourth|fifth|sixth|seventh|eighth|ninth)\b/g, (m, a, b) => (a === "twenty" ? 20 : 30) + ORD.indexOf(b) + 1);
    x = x.replace(/\btwentieth\b/g, "20").replace(/\bthirtieth\b/g, "30");
    ORD.forEach((w, i) => { x = x.replace(new RegExp("\\b" + w + "\\b", "g"), String(i + 1)); });
    return x;
  }
  function fmtDate(raw) {
    const t = String(raw).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(t)) return t;
    const ms = Date.parse(ordinalWords(t).replace(/(\d)(st|nd|rd|th)\b/gi, "$1").replace(/\bof\b/gi, "").replace(/\s+/g, " "));
    if (isNaN(ms)) return t;
    const d = new Date(ms), p = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}`;
  }
  function norm(s, v) {
    v = String(v == null ? "" : v).trim();
    if (!v) return "";
    switch (s.fmt) {
      case "tel": return fmtPhone(v);
      case "email": return fmtEmail(v);
      case "date": return fmtDate(v);
      case "nrc": { const d = digitsOf(v); return d.length === 9 ? `${d.slice(0,6)}/${d.slice(6,8)}/${d.slice(8)}` : v; }
      case "num": {
        let t = v.toLowerCase().replace(/,/g, "");
        t = t.replace(/(\d+(?:\.\d+)?)\s*thousand/, (_, n) => n * 1000).replace(/(\d+(?:\.\d+)?)\s*million/, (_, n) => n * 1000000);
        return digitsOf(t.replace(/\.\d+/, ""));
      }
      case "contact": return (/@|\bat\b.+\bdot\b/i.test(v)) ? fmtEmail(v) : fmtPhone(v);
      case "title": return v.replace(/\.$/, "").replace(/\s+/g, " ").replace(/(^|\s)([a-z])/g, (m, a, b) => a + b.toUpperCase());
      default: return v.replace(/\.$/, "").replace(/^[a-z]/, (c) => c.toUpperCase());
    }
  }
  function check(s, v) {
    if (!v) return s.req === false ? "" : "Please answer this question.";
    switch (s.fmt) {
      case "tel": { const n = digitsOf(v).length; if (n < 9 || n > 13) return "Please enter a valid phone number."; break; }
      case "email": if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "Please enter a valid email address."; break;
      case "nrc": if (!/^\d{6}\/\d{2}\/\d$/.test(v)) return "NRC looks like 123456/78/1. Please try again."; break;
      case "date": { const t = Date.parse(v); if (isNaN(t) || t > Date.now() || new Date(t).getFullYear() < 1900) return "Please enter a valid date of birth."; break; }
      case "num": if (!(Number(v) > 0)) return "Please enter an amount above zero."; break;
      case "contact": if (!(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || (digitsOf(v).length >= 9 && digitsOf(v).length <= 13))) return "Enter a valid phone number or email."; break;
      default: if (v.length < 2) return "Please give a little more detail.";
    }
    return "";
  }
  function disp(s, v) {
    if (!v) return "—";
    if (s.fmt === "date") return longDate(v);
    if (s.fmt === "num") return "K" + Number(v).toLocaleString("en-US");
    return v;
  }
  function spoken(s, v) {
    if (!v) return "none";
    if (s.fmt === "tel" || s.fmt === "nrc") return String(v).replace(/\//g, " slash ").replace(/\d/g, "$& ").replace(/\s+/g, " ").trim();
    if (s.fmt === "email") return v.replace(/@/g, " at ").replace(/\./g, " dot ");
    if (s.fmt === "contact") return /@/.test(v) ? v.replace(/@/g, " at ").replace(/\./g, " dot ") : spaced(v);
    if (s.fmt === "date") return longDate(v);
    if (s.fmt === "num") return `${Number(v)} kwacha`;
    return v;
  }
  function matchOpt(s, said) {
    const T = nz(said); if (!T) return null;
    const names = (o) => [o, ...((s.alias || {})[o] || [])].map(nz).filter(Boolean);
    for (const o of s.opts) if (names(o).some((a) => T === a || T.includes(a))) return o;
    for (const o of s.opts) if (T.length >= 3 && names(o).some((a) => a.includes(T))) return o;
    return null;
  }

  /* ---------- State ---------- */
  let root, S = null, opts = {};
  let voiceOn = true; try { voiceOn = localStorage.getItem("govai_voice") !== "off"; } catch (_) {}
  let rec = null, recActive = false, micWanted = false, speaking = false, speakId = 0, idle = 0;
  const $ = (id) => document.getElementById(id);
  const cur = () => S.flow.steps[S.i];
  const total = () => S.flow.steps.length;

  /* ---------- Speech output ---------- */
  function stopSpeak() { speakId++; speaking = false; if (TTS) try { speechSynthesis.cancel(); } catch (_) {} }
  function pauseRec() { if (rec && recActive) { try { rec.abort(); } catch (_) {} } }
  function speak(lines, force) {
    const list = (Array.isArray(lines) ? lines : [lines]).filter(Boolean);
    if (!TTS || (!voiceOn && !force) || !list.length) { startRec(); return; }
    stopSpeak(); pauseRec();
    const id = ++speakId; speaking = true; let n = 0;
    const nextLine = () => {
      if (id !== speakId) return;
      if (n >= list.length) { speaking = false; startRec(); return; }
      const u = new SpeechSynthesisUtterance(list[n++]);
      u.lang = "en-GB"; u.rate = 1;
      u.onend = nextLine; u.onerror = nextLine;
      try { speechSynthesis.speak(u); } catch (_) { speaking = false; startRec(); }
    };
    nextLine();
  }

  /* ---------- Speech input (voice commands + dictation) ---------- */
  function startRec() {
    if (!SR || !micWanted || speaking || recActive || !S) return;
    rec = new SR(); rec.lang = "en-GB"; rec.interimResults = true; rec.continuous = false; rec.maxAlternatives = 1;
    rec.onstart = () => { recActive = true; status("🎤 Listening… speak your answer or say “next”."); };
    rec.onresult = (e) => {
      let interim = "", final = "";
      for (let i = e.resultIndex; i < e.results.length; i++) { const r = e.results[i]; if (r.isFinal) final += r[0].transcript; else interim += r[0].transcript; }
      if (interim) heard(interim);
      if (final) { idle = 0; heard(final); handleVoice(final); }
    };
    rec.onerror = (e) => {
      if (e.error === "not-allowed" || e.error === "service-not-allowed") { micWanted = false; paintMic(); status("Microphone is blocked. Allow microphone access to use voice."); }
      else if (e.error === "no-speech") idle++;
    };
    rec.onend = () => {
      recActive = false;
      if (micWanted && !speaking && S) {
        if (idle >= 3) { micWanted = false; idle = 0; paintMic(); status("Mic paused. Tap 🎤 to continue."); return; }
        setTimeout(startRec, 250);
      }
    };
    try { rec.start(); } catch (_) { recActive = false; }
  }
  function stopRec() { micWanted = false; idle = 0; if (rec) { try { rec.abort(); } catch (_) {} } recActive = false; paintMic(); }
  function toggleMic() {
    if (!SR) return;
    if (micWanted) { stopRec(); status("Mic off."); return; }
    micWanted = true; idle = 0; paintMic(); status("🎤 Mic on."); startRec();
  }
  function paintMic() { const m = $("wizMic"); if (m) { m.classList.toggle("on", micWanted); m.setAttribute("aria-pressed", micWanted ? "true" : "false"); } }
  function status(msg) { const el = $("wizStatus"); if (el) el.textContent = msg || ""; }
  function heard(t) { const el = $("wizHeard"); if (el) el.textContent = t ? `Heard: “${t.trim()}”` : ""; }

  function command(t) {
    const v = S.view;
    if (/^(stop listening|stop|mic off|cancel)$/.test(t)) return () => { stopSpeak(); stopRec(); status("Voice stopped."); };
    if (/^(close|exit|quit|leave)$/.test(t)) return () => close(true);
    if (/^(back|go back|previous)$/.test(t) && (v === "step" || v === "review")) return back;
    if (v === "intro" && /^(start|begin|go|yes|ok|okay|next|continue|let'?s go)$/.test(t)) return begin;
    if (v === "step") {
      if (/^(next|continue|go on|done|save)$/.test(t)) return next;
      if (/^(repeat|say again|read( the)? question|read again|read it)$/.test(t)) return readQ;
      if (/^(clear|reset|delete|erase)$/.test(t)) return clearField;
      if (/^skip$/.test(t)) return skip;
      if (/^read (all|answers|everything|back)$/.test(t)) return () => speak(answerLines(true));
    }
    if (v === "review") {
      if (/^(create|confirm|submit|finish|yes|done|next|continue)$/.test(t)) return create;
      if (/^(read|read all|read answers|read back|read everything|repeat|read again)$/.test(t)) return readAll;
    }
    if (v === "result") {
      if (/^(done|close|finish|ok|okay)$/.test(t)) return () => close(true);
      if (/^(read|read again|read aloud|read all|read answers|repeat)$/.test(t)) return readResult;
      if (/^print$/.test(t)) return () => window.print();
      if (/^(start again|again|restart|new)$/.test(t)) return restart;
    }
    return null;
  }
  function handleVoice(raw) {
    if (!S) return;
    const t = raw.toLowerCase().replace(/[.,!?]/g, "").replace(/\s+/g, " ").trim();
    const cmd = command(t);
    if (cmd) { cmd(); return; }
    if (S.view === "step") fillFromVoice(raw, t);
  }
  function fillFromVoice(raw, t) {
    const s = cur(); let v;
    if (s.opts) {
      v = matchOpt(s, t);
      if (!v) { const m = `Sorry, I did not catch that. Say one of: ${s.opts.join(", ")}.`; showErr(m); speak(m); return; }
      S.a[s.k] = v; paintChoice(); showErr("");
      speak(`${v}. Say next to continue.`); return;
    }
    v = norm(s, raw);
    setInput(v);
    const err = check(s, v);
    if (err) { showErr(err); speak(err); return; }
    showErr("");
    speak(`Got it. ${spoken(s, v)}. Say next to continue.`);
  }

  /* ---------- DOM ---------- */
  function ensureDom() {
    if (root) return;
    root = document.createElement("div");
    root.id = "wiz"; root.className = "wiz hidden";
    root.setAttribute("role", "dialog"); root.setAttribute("aria-modal", "true"); root.setAttribute("aria-label", "Guided demo");
    root.innerHTML = '<div class="wiz-card"><header class="wiz-head"><button type="button" class="wiz-x" id="wizClose" aria-label="Close">×</button><div class="wiz-title" id="wizTitle"></div><button type="button" class="wiz-x" id="wizVoice" aria-label="Turn spoken read-out on or off"></button></header><div class="wiz-progress"><div class="wiz-bar" id="wizBar"></div></div><div class="wiz-body" id="wizBody"></div><div class="wiz-status" id="wizStatus" aria-live="polite"></div><footer class="wiz-foot" id="wizFoot"></footer></div>';
    document.body.appendChild(root);
    $("wizClose").onclick = () => close(false);
    $("wizVoice").onclick = () => {
      voiceOn = !voiceOn; try { localStorage.setItem("govai_voice", voiceOn ? "on" : "off"); } catch (_) {}
      if (!voiceOn) stopSpeak(); paintVoice(); status(voiceOn ? "Read-out on." : "Read-out off.");
    };
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && S) close(false); });
  }
  function paintVoice() { const b = $("wizVoice"); if (b) { b.textContent = voiceOn ? "🔊" : "🔇"; b.setAttribute("aria-pressed", voiceOn ? "true" : "false"); } }
  function setFoot(left, right) {
    const mic = SR ? `<button type="button" class="wiz-mic${micWanted ? " on" : ""}" id="wizMic" aria-label="Voice command" aria-pressed="${micWanted}">🎤</button>` : "<span></span>";
    const btn = (b, id) => b ? `<button type="button" class="wiz-btn ${b.cls || ""}" id="${id}" ${b.disabled ? "disabled" : ""}>${b.label}</button>` : "<span></span>";
    $("wizFoot").innerHTML = btn(left, "wizL") + mic + btn(right, "wizR");
    if (left && $("wizL")) $("wizL").onclick = left.fn;
    if (right && $("wizR")) $("wizR").onclick = right.fn;
    if (SR && $("wizMic")) $("wizMic").onclick = toggleMic;
  }

  function render() {
    const f = S.flow, n = total();
    $("wizTitle").textContent = f.title; paintVoice();
    const pct = S.view === "intro" ? 0 : S.view === "step" ? ((S.i + 1) / n) * 100 : 100;
    $("wizBar").style.width = pct + "%";
    const body = $("wizBody"); body.scrollTop = 0; status("");
    if (S.view === "intro") renderIntro(body);
    else if (S.view === "step") renderStep(body);
    else if (S.view === "review") renderReview(body);
    else renderResult(body);
  }

  function renderIntro(body) {
    const f = S.flow;
    body.innerHTML = `<div class="wiz-intro"><div class="wiz-ico">${f.icon}</div><h2>${esc(f.title)}</h2><p>${esc(f.intro)}</p><ul class="wiz-points"><li>10 short questions</li><li>Type, tap or speak your answers</li><li>Your answers are read out loud</li></ul><p class="wiz-note">Demo only. Nothing is sent to PACRA, ZRA or any government office.</p>${SR ? "" : '<p class="wiz-note">Voice commands are not available in this browser. Typing and read-out still work. Try Chrome for full voice.</p>'}</div>`;
    setFoot(null, {label: "Start", cls: "primary", fn: begin});
  }

  function renderStep(body) {
    const s = cur(), n = total(), val = S.a[s.k] || "";
    let input;
    if (s.opts && s.opts.length <= 5) {
      input = `<div class="wiz-pills" role="radiogroup" aria-label="${esc(s.label)}">${s.opts.map((o) => `<button type="button" role="radio" class="wiz-pill${o === val ? " sel" : ""}" data-v="${esc(o)}" aria-checked="${o === val}">${esc(o)}</button>`).join("")}</div>`;
    } else if (s.opts) {
      input = `<select id="wizIn" class="wiz-in" aria-label="${esc(s.label)}"><option value="">Choose…</option>${s.opts.map((o) => `<option${o === val ? " selected" : ""}>${esc(o)}</option>`).join("")}</select>`;
    } else if (s.type === "date") {
      input = `<input id="wizIn" class="wiz-in" type="date" max="${new Date().toISOString().slice(0, 10)}" value="${esc(val)}" aria-label="${esc(s.label)}">`;
    } else {
      input = `<input id="wizIn" class="wiz-in" type="${s.type || "text"}" ${s.inputmode ? `inputmode="${s.inputmode}"` : ""} autocomplete="off" placeholder="${esc(s.ph || "")}" value="${esc(val)}" aria-label="${esc(s.label)}">`;
    }
    body.innerHTML = `<form id="wizForm" class="wiz-step" novalidate><p class="wiz-count">Question ${S.i + 1} of ${n}</p><h2 class="wiz-q">${esc(s.q)}</h2>${s.hint ? `<p class="wiz-hint">${esc(s.hint)}</p>` : ""}${input}<p class="wiz-err" id="wizErr" role="alert"></p><div class="wiz-tools"><button type="button" class="wiz-link" id="wizRead">🔊 Read question</button>${s.req === false ? '<button type="button" class="wiz-link" id="wizSkip">Skip</button>' : ""}</div><p class="wiz-heard" id="wizHeard"></p><p class="wiz-cmds">${SR ? "Voice: say your answer, then “next”. Also: back, repeat, clear." : ""}</p></form>`;
    $("wizForm").onsubmit = (e) => { e.preventDefault(); next(); };
    $("wizRead").onclick = readQ;
    if ($("wizSkip")) $("wizSkip").onclick = skip;
    body.querySelectorAll(".wiz-pill").forEach((b) => { b.onclick = () => { S.a[s.k] = b.dataset.v; paintChoice(); showErr(""); }; });
    const sel = $("wizIn"); if (sel && sel.tagName === "SELECT") sel.onchange = () => { S.a[s.k] = sel.value; showErr(""); };
    const last = S.i === n - 1;
    setFoot(
      {label: "Back", fn: back},
      {label: S.fromReview ? "Save" : last ? "Review" : "Next", cls: "primary", fn: next}
    );
    if (sel && sel.tagName === "INPUT" && !("ontouchstart" in window)) sel.focus({preventScroll: true});
  }
  function paintChoice() {
    const s = cur(), v = S.a[s.k] || "";
    document.querySelectorAll(".wiz-pill").forEach((b) => { const on = b.dataset.v === v; b.classList.toggle("sel", on); b.setAttribute("aria-checked", on); });
    const sel = $("wizIn"); if (sel && sel.tagName === "SELECT") sel.value = v;
  }
  function setInput(v) { const el = $("wizIn"); if (el) el.value = v; }
  function showErr(m) { const el = $("wizErr"); if (el) el.textContent = m || ""; }
  function getVal() { const s = cur(); if (s.opts) return S.a[s.k] || ""; const el = $("wizIn"); return el ? el.value : ""; }

  function renderReview(body) {
    const f = S.flow;
    body.innerHTML = `<div class="wiz-review"><h2>Check your answers</h2><p class="wiz-hint">Tap Edit to change anything.</p><ol class="wiz-list">${f.steps.map((s, i) => `<li><div><span>${esc(s.label)}</span><strong>${esc(disp(s, S.a[s.k]))}</strong></div><button type="button" class="wiz-edit" data-i="${i}" aria-label="Edit ${esc(s.label)}">Edit</button></li>`).join("")}</ol><button type="button" class="wiz-link" id="wizReadAll">🔊 Read all answers</button></div>`;
    $("wizReadAll").onclick = readAll;
    body.querySelectorAll(".wiz-edit").forEach((b) => { b.onclick = () => { S.fromReview = true; go("step", +b.dataset.i); }; });
    setFoot({label: "Back", fn: back}, {label: "Create (demo)", cls: "primary", fn: create});
  }

  function renderResult(body) {
    const r = S.result;
    body.innerHTML = `<div class="wiz-result-wrap"><article class="wiz-result" id="wizResult"><div class="wiz-demo-tag">DEMO</div><div class="wiz-check" aria-hidden="true">✓</div><p class="wiz-kicker">${esc(r.badge)}</p><h2>${esc(r.head)}</h2><div class="wiz-main">${esc(r.main)}</div>${r.tagline ? `<p class="wiz-tagline">${esc(r.tagline)}</p>` : ""}${r.id ? `<div class="wiz-id"><span>${esc(r.id.label)}</span><strong>${esc(r.id.value)}</strong></div>` : ""}${r.summary ? `<p class="wiz-summary">${esc(r.summary)}</p>` : ""}<dl class="wiz-rows">${r.rows.filter((x) => x[1] && x[1] !== "—").map((x) => `<div><dt>${esc(x[0])}</dt><dd>${esc(x[1])}</dd></div>`).join("")}</dl><p class="wiz-fine">${esc(r.fine)}</p></article><div class="wiz-actions"><button type="button" class="wiz-link" id="wizReadRes">🔊 Read aloud</button><button type="button" class="wiz-link" id="wizAgain">↺ Start again</button></div></div>`;
    $("wizReadRes").onclick = readResult; $("wizAgain").onclick = restart;
    setFoot({label: "Print", fn: () => window.print()}, {label: "Done", cls: "primary", fn: () => close(true)});
  }

  /* ---------- Navigation ---------- */
  function go(view, i) {
    S.view = view; if (typeof i === "number") S.i = i;
    render();
    if (view === "step") speak(`Question ${S.i + 1}. ${cur().q}${cur().hint && !/“/.test(cur().hint) ? " " + cur().hint : ""}`);
    else if (view === "review") speak(answerLines(false));
    else if (view === "result") speak(S.result.speak);
  }
  function begin() { S.fromReview = false; go("step", 0); }
  function back() {
    if (S.view === "review") { S.fromReview = false; go("step", total() - 1); return; }
    if (S.fromReview) { S.fromReview = false; go("review"); return; }
    if (S.i > 0) go("step", S.i - 1); else go("intro");
  }
  function next() {
    const s = cur(), v = norm(s, getVal()), err = check(s, v);
    if (err) { showErr(err); speak(err); return; }
    S.a[s.k] = v;
    if (S.fromReview) { S.fromReview = false; go("review"); return; }
    if (S.i < total() - 1) go("step", S.i + 1); else go("review");
  }
  function skip() { const s = cur(); if (s.req !== false) { const m = "This question cannot be skipped."; showErr(m); speak(m); return; } S.a[s.k] = ""; next(); }
  function clearField() { const s = cur(); S.a[s.k] = ""; if (s.opts) paintChoice(); else setInput(""); showErr(""); heard(""); speak("Cleared. Say your answer."); }
  function readQ() { const s = cur(); speak(`Question ${S.i + 1}. ${s.q}`, true); }
  function answerLines(onlyDone) {
    const f = S.flow;
    const lines = (onlyDone ? f.steps.slice(0, S.i) : f.steps).map((s) => `${s.label}: ${spoken(s, S.a[s.k])}.`);
    return onlyDone ? lines : ["Please check your answers.", ...lines, "Say create to finish, or tap Edit to change something."];
  }
  function readAll() { speak(answerLines(false), true); }
  function readResult() { speak(S.result.speak, true); }
  function create() {
    const f = S.flow, d = {};
    f.steps.forEach((s) => { d[s.k] = disp(s, S.a[s.k]); });
    const r = f.build(d);
    r.text = [`${r.badge.toUpperCase()} (DEMO)`, "", r.head, r.main + (r.id ? `  [${r.id.label}: ${r.id.value}]` : ""), r.summary || "", "", ...r.rows.filter((x) => x[1] && x[1] !== "—").map((x) => `${x[0]}: ${x[1]}`), "", r.fine].filter((l, i, a) => l !== "" || (a[i - 1] !== "")).join("\n");
    S.result = r; S.view = "result";
    if (opts.onComplete) { try { opts.onComplete(f, r); } catch (_) {} }
    go("result");
  }
  function restart() { stopSpeak(); const f = S.flow; S.a = {}; S.result = null; S.fromReview = false; go("intro"); }

  function close(force) {
    if (!S) return;
    if (!force && (S.view === "step" || S.view === "review") && Object.keys(S.a).length && !confirm("Leave this demo? Your answers will be lost.")) return;
    stopSpeak(); stopRec();
    S = null; root.classList.add("hidden"); document.body.classList.remove("wiz-open");
    if (opts.onClose) { try { opts.onClose(); } catch (_) {} }
  }

  function start(key, o) {
    const flow = FLOWS[key]; if (!flow) return;
    ensureDom(); opts = o || {};
    stopSpeak(); stopRec();
    S = {flow, view: "intro", i: 0, a: {}, result: null, fromReview: false};
    root.classList.remove("hidden"); document.body.classList.add("wiz-open");
    render();
    speak(`${flow.title}. ${flow.intro} Tap Start, or tap the microphone to use your voice.`);
  }

  window.GOVAIWizard = {start, flows: FLOWS, isOpen: () => !!S};
})();
