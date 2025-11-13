/* script.js — funcionalidade principal (cliente-only) */
/* Gera links com token (base64 de payload), painéis individuais, sorteio e wishlist com imagens e busca */
function uid(len=8){const s='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';let r='';for(let i=0;i<len;i++) r+=s.charAt(Math.floor(Math.random()*s.length));return r}
function q(id){return document.getElementById(id)}
const SUGGESTIONS = [
  {title:'Fone Bluetooth', query:'fone bluetooth', img:'https://images.unsplash.com/photo-1585386959984-a4155220d597?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&s=1'},
  {title:'Relógio Smart', query:'smartwatch', img:'https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&s=2'},
  {title:'Caneca Personalizada', query:'caneca personalizada', img:'https://images.unsplash.com/photo-1517686469429-8a9fcb9f4d9d?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&s=3'},
  {title:'Livro Best-seller', query:'book best seller', img:'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&s=4'},
  {title:'Kit Skincare', query:'skin care kit', img:'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&s=5'},
  {title:'Acessórios para Casa', query:'home accessories', img:'https://images.unsplash.com/photo-1505691723518-36a6f3a3b4a4?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&s=6'}
];

/* --- Criar grupo e tokens --- */
document.addEventListener('DOMContentLoaded', ()=> {
  const btnCreate = q('btnCreate');
  if(btnCreate) btnCreate.addEventListener('click', () => {
    const raw = q('participants').value.trim();
    const group = q('groupName').value.trim() || 'Grupo';
    if(!raw){ alert('Adicione pelo menos 2 participantes'); return; }
    const names = raw.split(/\n+/).map(s=>s.trim()).filter(Boolean);
    if(names.length < 2){ alert('Adicione ao menos 2 participantes'); return; }
    // embaralhar e calcular assignment (derangement-ish)
    const shuffled = [...names].sort(()=>Math.random()-0.5);
    const assign = {};
    for(let i=0;i<names.length;i++){
      assign[names[i]] = (shuffled[i] === names[i]) ? shuffled[(i+1)%names.length] : shuffled[i];
    }
    // gerar tokens
    const base = window.location.origin + window.location.pathname;
    const mapping = {};
    const listEl = q('tokenList'); listEl.innerHTML = '';
    names.forEach(n => {
      const payload = { group, giver: n, receiver: assign[n], ts: Date.now(), id: uid(8) };
      const token = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
      const link = `${base}?token=${token}`;
      mapping[n] = link;
      const li = document.createElement('li');
      li.innerHTML = `<strong>${n}</strong>: <a href="${link}" target="_blank" rel="noopener">${link}</a> <button onclick="copyText('${link.replace(/'/g,"\\'")}')">Copiar</button>`;
      listEl.appendChild(li);
    });
    q('linksArea').classList.remove('hide');
    localStorage.setItem('lastGroup', JSON.stringify({group, mapping, created:Date.now()}));
    // criar painéis
    setupPanels(names, mapping);
    q('panelList').classList.remove('hide');
    q('setup').classList.add('hide');
  });

  const btnCopyAll = q('btnCopyAll');
  if(btnCopyAll) btnCopyAll.addEventListener('click', ()=> {
    const last = JSON.parse(localStorage.getItem('lastGroup') || '{}');
    const mapping = last.mapping || {};
    let txt = 'Links do grupo:\n';
    for(const k in mapping) txt += `${k}: ${mapping[k]}\n`;
    navigator.clipboard.writeText(txt).then(()=>alert('Todos os links copiados para a área de transferência'));
  });

  const btnDownloadZip = q('btnDownloadZip');
  if(btnDownloadZip) btnDownloadZip.addEventListener('click', ()=> {
    alert('Vou gerar um pacote ZIP com os arquivos para você subir ao GitHub. Baixe e faça o upload no seu repositório.');
    // trigger download of each file separately
    downloadFile('index.html', `<!doctype html>` + document.documentElement.outerHTML);
    // styles and script are provided separately via the ZIP (not generated here)
  });
});

/* helper functions */
function copyText(t){ navigator.clipboard.writeText(t).then(()=>alert('Link copiado')) }

/* --- Painéis individuais --- */
function setupPanels(names, mapping){
  const peopleList = q('peopleList'); peopleList.innerHTML='';
  const panels = q('peoplePanels'); panels.innerHTML='';
  names.forEach(n => {
    const btn = document.createElement('button'); btn.className='person-btn'; btn.textContent = n;
    btn.onclick = ()=> openPanel(n, mapping[n]);
    peopleList.appendChild(btn);

    const panel = document.createElement('div'); panel.className = 'panel'; panel.id = 'panel_'+n;
    panel.innerHTML = `
      <h3>${n}</h3>
      <p class="small">Abra seu link secreto (enviado pelo organizador) ou clique em "Ver meu sorteado" abaixo.</p>
      <div class="panel-actions">
        <button onclick="doSpin('${n}','${encodeURIComponent(mapping[n])}')">Ver quem eu tirei (roleta)</button>
      </div>
      <div id="result_${n}" class="result" style="margin-top:12px"></div>

      <div style="margin-top:12px">
        <label>Pesquisar presentes</label>
        <div style="display:flex;gap:8px">
          <input id="search_input_${n}" placeholder="Ex: fone bluetooth" />
          <button onclick="searchAndSave('${n}')">Buscar</button>
        </div>
        <div class="suggest-grid" id="suggestions_${n}"></div>
      </div>

      <div style="margin-top:12px">
        <h4>Wishlist do amigo que você tirou</h4>
        <div id="wishlist_${n}"></div>
      </div>
    `;
    panels.appendChild(panel);
  });
}

/* --- Roleta (simples): anima nomes e revela --- */
function doSpin(viewer, tokenEnc){
  let token = decodeURIComponent(tokenEnc);
  token = token.replace('?token=','');
  try{
    if(token.startsWith('http')) token = token.split('?token=')[1];
  }catch(e){}
  try{
    const payload = JSON.parse(decodeURIComponent(escape(atob(token))));
    const resultBox = q('result_'+viewer);
    resultBox.innerHTML = `<div class="spinner-large"></div><p class="small">Girando...</p>`;
    const names = Object.keys(JSON.parse(localStorage.getItem('lastGroup') || '{"mapping":{}}').mapping || {});
    let i = 0;
    const interval = setInterval(()=> {
      const pick = names[Math.floor(Math.random()*names.length)];
      resultBox.innerHTML = `<p style="font-size:18px;color:var(--accent)">${pick}</p>`;
      i++;
      if(i>12){ clearInterval(interval); resultBox.innerHTML = `<p>Você tirou: <strong>${payload.receiver}</strong></p>`; loadWishlistForViewer(viewer, payload.receiver); }
    },120);
  }catch(e){
    alert('Token inválido ou corrompido. Use o link enviado pelo organizador.');
  }
}

/* --- SUGESTÕES INICIAIS (com imagens) --- */
function renderSuggestionsFor(person, list){ const el = q('suggestions_'+person); el.innerHTML=''; list.forEach(it=>{ const card = document.createElement('div'); card.className='suggest-card'; card.innerHTML = `<img src="${it.img}" alt="${it.title}"><div class="title">${it.title}</div><div class="actions"><a href="${makeLinks(it.query).shopee}" target="_blank">Shopee</a><a href="${makeLinks(it.query).aliexpress}" target="_blank">AliExpress</a><a href="${makeLinks(it.query).amazon}" target="_blank">Amazon</a><button onclick="addToWishlist('${person}','${escape(it.title)}','${escape(it.img)}','${escape(JSON.stringify(makeLinks(it.query)))}')">Adicionar</button></div>`; el.appendChild(card); })}

/* make external store links */
function makeLinks(qStr){ const q=encodeURIComponent(qStr); return { shopee:`https://shopee.com.br/search?keyword=${q}`, aliexpress:`https://www.aliexpress.com/wholesale?SearchText=${q}`, amazon:`https://www.amazon.com.br/s?k=${q}` } }

/* initial render suggestions per user when opening panel */
function loadWishlistForViewer(viewer, friendName){
  const target = friendName || null;
  renderSuggestionsFor(viewer, SUGGESTIONS);
  const wDiv = q('wishlist_'+viewer);
  wDiv.innerHTML = '';
  if(target){
    const list = JSON.parse(localStorage.getItem('wishlist_of_'+target) || '[]');
    if(list.length===0) wDiv.innerHTML = '<p class="small">(nenhum item salvo)</p>';
    else wDiv.innerHTML = list.map(it=>`<div class="suggest-card"><img src="${it.img}"><div class="title">${it.title}</div><div class="actions"><a href="${it.link.shopee}" target="_blank">Shopee</a></div></div>`).join('');
  } else {
    wDiv.innerHTML = '<p class="small">(Clique em "Ver quem eu tirei" para ver a wishlist desse amigo)</p>';
  }
}

/* search and save search results as wishlist items (preview) */
function searchAndSave(viewer){
  const input = q('search_input_'+viewer);
  const qTerm = input.value.trim();
  if(!qTerm) return alert('Digite algo para buscar');
  const img = `https://source.unsplash.com/800x600/?${encodeURIComponent(qTerm)}`;
  const links = makeLinks(qTerm);
  const item = { title: qTerm, img, link: links };
  const key = 'searches_for_'+viewer;
  const arr = JSON.parse(localStorage.getItem(key) || '[]');
  arr.unshift(item);
  localStorage.setItem(key, JSON.stringify(arr));
  renderSuggestionsFor(viewer, [{title:qTerm, query:qTerm, img}].concat(SUGGESTIONS));
  alert('Resultados prontos — clique em "Adicionar" para incluir em uma wishlist do amigo que você tirou.');
}

/* add to wishlist of target friend */
function addToWishlist(viewer, titleEsc, imgEsc, linksEsc){
  const title = unescape(titleEsc);
  const img = unescape(imgEsc);
  const links = JSON.parse(unescape(linksEsc));
  let target = prompt('Qual é o nome da pessoa que você tirou? (para salvar na wishlist dela)', '');
  if(!target) return;
  const key = 'wishlist_of_'+target;
  const arr = JSON.parse(localStorage.getItem(key) || '[]');
  arr.unshift({ title, img, link: links });
  localStorage.setItem(key, JSON.stringify(arr));
  alert('Item adicionado à wishlist de '+target);
}

/* helper: download text file */
function downloadFile(filename, text){
  const a = document.createElement('a');
  const blob = new Blob([text], {type:'text/plain;charset=utf-8'});
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

/* try to auto-open if token present in URL (participant view) */
(function init(){
  const p = new URLSearchParams(location.search);
  const token = p.get('token');
  if(token){
    try{
      const payload = JSON.parse(decodeURIComponent(escape(atob(token))));
      const content = document.createElement('div');
      content.className = 'card';
      content.innerHTML = `<h2>Olá, ${payload.giver}!</h2><p>Você tirou: <strong>${payload.receiver}</strong></p><h3>Wishlist</h3><div id="wl_${payload.giver}"></div>`;
      document.body.prepend(content);
      const w = JSON.parse(localStorage.getItem('wishlist_of_'+payload.receiver) || '[]');
      const holder = q('wl_'+payload.giver);
      holder.innerHTML = w.length===0?'<p class="small">(nenhum item)</p>': w.map(it=>`<div class="suggest-card"><img src="${it.img}"><div class="title">${it.title}</div><div class="actions"><a href="${it.link.shopee}" target="_blank">Shopee</a></div></div>`).join('');
    }catch(e){}
  }
})();
