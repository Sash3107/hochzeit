/***** EINSTELLUNGEN *****/
const SCRIPT_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbyHrr7ZZV_SVZYHJrMQUaTExrm2ftyS0cToK2yKdWJdxl9iI4-HwT9GGBtoit27s3mM/exec";
const ADMIN_PASSWORD_HASH = "07624e9bfe204cd25b18b2b68786c509b094788304a5141411f03926fe88e4fc";
const SHEET_URL = "https://docs.google.com/spreadsheets/d/1jlm7rWakkZDUe8bRUKS7utz53PbbtHgMjtxfJ-A6-IM/edit?gid=0#gid=0";

/***** HELFER *****/
async function sha256Hex(str){
  const enc = new TextEncoder().encode(str);
  const buf = await crypto.subtle.digest('SHA-256', enc);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
}
function qs(sel,root=document){ return root.querySelector(sel); }

/***** INDEX: Formular *****/
(function initIndex(){
  const form = qs('#rsvpForm');
  if(!form) return;
  const blockIfJa = qs('#blockIfJa');
  const msg = qs('#msg');

  function applyTeilnahmeState(){
    const t = form.teilnahme.value;
    const show = (t === 'Ja');
    blockIfJa.style.display = show ? '' : 'none';
    for (const el of form.querySelectorAll('input[name="begleitung"], input[name="ernaehrung"]')){
      if (el.type === 'radio') el.required = show;
    }
  }
  form.addEventListener('change', applyTeilnahmeState);
  applyTeilnahmeState();

  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    msg.hidden = true;
    if (!form.checkValidity()){ form.reportValidity(); return; }

    const teilnahme = form.teilnahme.value || '';
    const coming = teilnahme === 'Ja';
    const data = {
      name: (form.name.value||'').trim(),
      teilnahme,
      begleitung: coming ? (form.begleitung.value || '') : 'Nein',
      kinder: coming ? Number(form.kinder.value||0) : 0,
      ernaehrung: coming ? (form.ernaehrung.value||'') : '',
      kommentar: (form.kommentar.value||'').trim()
    };

    try{
      const res = await fetch(SCRIPT_WEB_APP_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(data)
      });
      const json = await res.json();
      if(json.ok){
        let text = "Danke! Wir freuen uns auf dich!";
        if (teilnahme === 'Nein') text = "Danke für deine Rückmeldung!";
        if (teilnahme === 'Ja' && data.begleitung === 'Ja') text = "Danke, wir freuen uns auf euch!";
        msg.textContent = text;
        msg.hidden = false;
        form.reset();
        applyTeilnahmeState();
        qs('input[name="name"]').focus();
      } else { throw new Error(json.error || 'Unbekannter Fehler'); }
    }catch(err){
      console.error(err);
      msg.textContent = "Fehler beim Senden. Bitte später erneut versuchen.";
      msg.hidden = false;
    }
  });
})();

/***** ADMIN: Login & Stats *****/
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
    return await res.json();
  }
  async function renderStats(){
    try{
      const json = await fetchStats();
      if (!json.ok) throw new Error('Backend-Fehler');
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
      loginBox.hidden = true; stats.hidden = false;
      renderStats(); window.__statTimer = setInterval(renderStats, 10000);
    } else {
      loginErr.hidden = false; setTimeout(()=> loginErr.hidden = true, 2500);
    }
    pwd.value = '';
  });
  btnRefresh.addEventListener('click', renderStats);
})();
