/***** EINSTELLUNGEN *****/
// ⬇️ HIER deine aktuelle /exec-URL eintragen
const SCRIPT_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzz3srWJd-s54Uv08u4whxlLT6Mxy8vJpItzDX5rdd28G420qDnp8E23vh-yVEnw_Qn/exec";

// Admin-Login (unverändert)
const ADMIN_PASSWORD_HASH = "07624e9bfe204cd25b18b2b68786c509b094788304a5141411f03926fe88e4fc";
const SHEET_URL = "https://docs.google.com/spreadsheets/d/1jlm7rWakkZDUe8bRUKS7utz53PbbtHgMjtxfJ-A6-IM/edit?gid=0";

/***** HELFER *****/
async function sha256Hex(str){
  const enc = new TextEncoder().encode(str);
  const buf = await crypto.subtle.digest('SHA-256', enc);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
}
const qs = (sel, root=document) => root.querySelector(sel);

function setRequiredRadios(name, required){
  document.querySelectorAll(`input[name="${name}"]`).forEach(r => r.required = !!required);
}

/***** INDEX: Formular *****/
(function initIndex(){
  const form = qs('#rsvpForm');
  if(!form) return;

  const blockIfJa = qs('#blockIfJa');
  const blockBegleitung = qs('#begleitungErnaehrung');
  const msg = qs('#msg');

  function applyTeilnahmeState(){
    const teilnahme = (form.teilnahme?.value) || '';
    const show = (teilnahme === 'Ja');

    blockIfJa.style.display = show ? '' : 'none';
    blockBegleitung.hidden = true;

    setRequiredRadios('begleitung', show);
    setRequiredRadios('ernaehrung', show);
    setRequiredRadios('begleitungErnaehrung', false); // erst bei +1=Ja
  }

  // Teilnahme ändern
  form.addEventListener('change', (e)=>{
    if (e.target && e.target.name === 'teilnahme') applyTeilnahmeState();
    if (e.target && e.target.name === 'begleitung') {
      const plusOne = e.target.value === 'Ja';
      blockBegleitung.hidden = !plusOne;
      setRequiredRadios('begleitungErnaehrung', plusOne);
    }
  });

  // Initial setzen
  applyTeilnahmeState();

  // Absenden
  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    msg.hidden = true;

    if (!form.checkValidity()){ form.reportValidity(); return; }

    const teilnahme = form.teilnahme.value || '';
    const coming = teilnahme === 'Ja';
    const plusOne = coming && (form.begleitung?.value === 'Ja');

    const data = {
      name: (form.name.value||'').trim(),
      teilnahme,
      begleitung: coming ? (form.begleitung?.value || '') : 'Nein',
      kinder: coming ? Number(form.kinder.value||0) : 0,
      ernaehrung: coming ? (form.ernaehrung?.value||'') : '',
      begleitungErnaehrung: plusOne ? (form.begleitungErnaehrung?.value || '') : '',
      kommentar: (form.kommentar.value||'').trim()
    };

    try{
      const res = await fetch(SCRIPT_WEB_APP_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // simple request → kein Preflight
        body: JSON.stringify(data)
      });

      // Fallback, falls Backend keine JSON-Antwort liefert
      let json;
      const text = await res.text();
      try { json = JSON.parse(text); } catch { json = { ok:false, error:`Backend returned non-JSON: ${text.slice(0,120)}` }; }

      if (res.ok && json.ok){
        let thank = "Danke! Wir freuen uns auf dich!";
        if (teilnahme === "Nein") thank = "Danke für deine Rückmeldung!";
        if (plusOne) thank = "Danke, wir freuen uns auf euch!";

        // Formular weg, Nachricht sichtbar
        form.style.display = "none";
        msg.textContent = thank;
        msg.hidden = false;
        msg.style.fontSize = "1.4rem";
        msg.style.fontWeight = "600";
        msg.style.textAlign = "center";
        msg.style.marginTop = "2em";
      } else {
        console.error('Submit failed:', json.error || text);
        msg.textContent = "Fehler beim Senden. Bitte später erneut versuchen.";
        msg.hidden = false;
      }
    }catch(err){
      console.error(err);
      msg.textContent = "Netzwerkfehler beim Senden. Bitte später erneut versuchen.";
      msg.hidden = false;
    }
  });
})();

/***** ADMIN: Login & Statistik *****/
(function initAdmin(){
  const loginBox = qs('#loginBox');
  if(!loginBox) return;

  const pwd = qs('#adminPwd');
  const loginBtn = qs('#loginBtn');
  const loginErr = qs('#loginErr');
  const stats = qs('#stats');
  const sheetLink = qs('#sheetLink');
  const btnRefresh = qs('#refreshBtn');

  if (SHEET_URL && sheetLink) sheetLink.href = SHEET_URL;

  async function fetchStats(){
    const url = `${SCRIPT_WEB_APP_URL}?action=stats`;
    const res = await fetch(url);
    const text = await res.text();
    try { return JSON.parse(text); } catch { return { ok:false, error:`Non-JSON: ${text}` }; }
  }

  async function renderStats(){
    try{
      const json = await fetchStats();
      if (!json.ok) throw new Error(json.error || 'Backend-Fehler');

      qs('#kpiErwachsene').textContent = json.erwachsene;
      qs('#kpiKinder').textContent     = json.kinder;
      qs('#kpiVeg').textContent        = json.vegetarier;
      qs('#kpiVegan').textContent      = json.veganer;
      qs('#kpiPlusOne').textContent    = json.plusOne;
      qs('#kpiAbsagen').textContent    = json.absagen;
    }catch(err){ console.error(err); }
  }

  loginBtn.addEventListener('click', async ()=>{
    const hash = await sha256Hex(pwd.value);
    if (hash === ADMIN_PASSWORD_HASH){
      loginBox.hidden = true;
      stats.hidden = false;
      renderStats();
      window.__statTimer = setInterval(renderStats, 10000);
    } else {
      loginErr.hidden = false;
      setTimeout(()=> loginErr.hidden = true, 2500);
    }
    pwd.value = '';
  });

  btnRefresh.addEventListener('click', renderStats);
})();
