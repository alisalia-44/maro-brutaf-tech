(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const DEMO_EMAIL = 'admin@maro.bf';
  const DEMO_PASSWORD = 'admin123'; // Prototype only. Replace with Supabase Auth before publication.
  const STORE_PRODUCTS_KEY = 'maro_p';
  const STORE_SETTINGS_KEY = 'maro_s';
  const DEFAULT_SETTINGS = {wa:'2130670462357', adresse:'Koulouba, Ouagadougou', horaires:'Lun-Sam : 08h-20h', aproposTitre:'Votre expert mobile', aproposTexte:'Vente et Troc sécurisés.', annonce:'', facebook:'', instagram:''};
  const DEFAULT_PRODUCTS = [
    {id:1,cat:'iphone',marque:'Apple',modele:'iPhone 16 Pro Max',etat:'neuf',nouveau:true,troc:true,visible:true,image:'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80',desc:'Téléphone authentique, scellé dans sa boîte. Vendu avec garantie boutique.',specs:{'Écran':'6.7 pouces OLED 120 Hz','SIM':'Nano SIM + eSIM','RAM':'8 Go','Garantie':'12 mois boutique'},cap:[{c:'256 Go',p:925000,s:1},{c:'512 Go',p:1050000,s:1}],col:[{n:'Titane Noir',h:'#333333'},{n:'Titane Blanc',h:'#e3e3e3'}]},
    {id:2,cat:'iphone',marque:'Apple',modele:'iPhone 15 Pro',etat:'venue',nouveau:true,troc:true,visible:true,image:'https://images.unsplash.com/photo-1696446701796-da61225697cc?auto=format&fit=crop&w=800&q=80',desc:'Appareil d’occasion très propre. Test complet sur place.',specs:{'Écran':'6.1 pouces Super Retina XDR','Santé Batterie':'89%','Garantie':'1 mois boutique'},cap:[{c:'128 Go',p:650000,s:2}],col:[{n:'Titane Noir',h:'#424240'},{n:'Titane Bleu',h:'#1a2c42'}]},
    {id:3,cat:'android',marque:'Samsung',modele:'Galaxy S23 Ultra',etat:'venue',nouveau:true,troc:true,visible:true,image:'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=800&q=80',desc:'Appareil d’occasion certifié. Stylet d’origine inclus et fonctionnel.',specs:{'Écran':'6.8 pouces Dynamic AMOLED 2X','Stylet':'S-Pen inclus'},cap:[{c:'256 Go',p:450000,s:1}],col:[{n:'Noir Fantôme',h:'#212121'},{n:'Crème',h:'#e6dfd1'}]},
    {id:4,cat:'android',marque:'Xiaomi',modele:'Redmi Note 13 Pro',etat:'neuf',nouveau:true,troc:false,visible:true,image:'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80',desc:'Idéal pour un usage intensif, charge rapide.',specs:{'Écran':'6.67 pouces AMOLED 120 Hz','Appareil photo':'200 Mpx','Charge':'67W'},cap:[{c:'256 Go',p:165000,s:6}],col:[{n:'Noir Minuit',h:'#000000'}]}
  ];
  let products = [], settings = {}, editingId = null, toastTimer = null;
  const escapeHtml = (v) => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const money = n => Number(n || 0).toLocaleString('fr-FR') + ' FCFA';
  function read(key, fallback) { try { const v = localStorage.getItem(key); return v === null ? fallback : JSON.parse(v); } catch { return fallback; } }
  function write(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
  function loadData() {
    const savedProducts = read(STORE_PRODUCTS_KEY, null);
    products = Array.isArray(savedProducts) ? savedProducts : structuredClone(DEFAULT_PRODUCTS);
    settings = {...DEFAULT_SETTINGS, ...(read(STORE_SETTINGS_KEY, {}) || {})};
    if (!Array.isArray(products)) products = structuredClone(DEFAULT_PRODUCTS);
  }
  function saveProducts() { write(STORE_PRODUCTS_KEY, products); renderProducts(); renderStats(); }
  function showToast(message) { const el=$('toast'); el.textContent=message; el.classList.add('show'); clearTimeout(toastTimer); toastTimer=setTimeout(()=>el.classList.remove('show'),2500); }
  function showDashboard() { $('login-panel').hidden=true; $('dashboard').hidden=false; renderProducts(); renderStats(); fillSettings(); }
  function logout() { sessionStorage.removeItem('maro_admin_demo_session'); $('dashboard').hidden=true; $('login-panel').hidden=false; $('login-password').value=''; }
  $('login-form').addEventListener('submit', e => { e.preventDefault(); const email=$('login-email').value.trim().toLowerCase(); const password=$('login-password').value; if(email===DEMO_EMAIL && password===DEMO_PASSWORD){sessionStorage.setItem('maro_admin_demo_session','1'); $('login-error').hidden=true; showDashboard();} else {$('login-error').hidden=false;} });
  $('logout-button').addEventListener('click', logout);
  document.querySelectorAll('[data-tab]').forEach(button => button.addEventListener('click', () => { document.querySelectorAll('[data-tab]').forEach(b=>b.classList.toggle('active',b===button)); document.querySelectorAll('.tab-panel').forEach(p=>p.hidden=p.id!==`tab-${button.dataset.tab}`); }));
  function renderStats(){ $('stat-products').textContent=products.length; $('stat-visible').textContent=products.filter(p=>p.visible!==false).length; }
  function renderProducts(){
    const list=$('product-list'); $('empty-products').hidden=products.length!==0;
    list.innerHTML=products.map(p=>{
      const image=p.image || '';
      const variants=(p.cap||[]).map((v,i)=>`<div class="variant-editor"><div class="variant-editor-top"><strong>${escapeHtml(v.c||'Standard')}</strong></div><div class="variant-fields variant-fields-single"><label>Prix (FCFA)<input type="number" min="0" step="500" data-price-id="${p.id}" data-variant="${i}" value="${Number(v.p)||0}" aria-label="Prix ${escapeHtml(v.c)}"></label></div></div>`).join('');
      return `<article class="product-card"><img class="product-image" src="${escapeHtml(image)}" alt="" onerror="this.onerror=null;this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 80 100%22%3E%3Crect width=%2280%22 height=%22100%22 fill=%22%23eee%22/%3E%3Ctext x=%2240%22 y=%2255%22 text-anchor=%22middle%22 font-size=%2228%22%3E📱%3C/text%3E%3C/svg%3E'"><div class="product-info"><div class="product-title-row"><div><h3 class="product-title">${escapeHtml(p.modele)}</h3><p class="product-subtitle">${escapeHtml(p.marque)} · ${escapeHtml(({neuf:'Neuf scellé',venue:'Très propre',occasion:'Occasion'})[p.etat]||'État non précisé')}</p></div><span class="status ${p.visible===false?'hidden-status':'visible'}">${p.visible===false?'Masqué':'Visible'}</span></div>${variants}<div class="product-actions"><button class="text-button" type="button" data-edit="${p.id}">✎ Modifier les informations</button><button class="text-button" type="button" data-toggle="${p.id}">${p.visible===false?'Afficher dans la boutique':'Masquer'}</button><button class="text-button danger" type="button" data-delete="${p.id}">Supprimer</button></div></div></article>`;
    }).join('');
  }
  $('product-list').addEventListener('change', e=>{
    const t=e.target; if(t.dataset.priceId){const p=products.find(x=>String(x.id)===t.dataset.priceId); if(!p)return; p.cap[Number(t.dataset.variant)].p=Math.max(0,Number(t.value)||0); saveProducts(); showToast('Prix enregistré dans ce navigateur.');}
  });
  $('product-list').addEventListener('click',e=>{
    const edit=e.target.closest('[data-edit]'); const toggle=e.target.closest('[data-toggle]'); const del=e.target.closest('[data-delete]');
    if(edit) openProductForm(products.find(p=>String(p.id)===edit.dataset.edit));
    if(toggle){const p=products.find(p=>String(p.id)===toggle.dataset.toggle);if(p){p.visible=p.visible===false;saveProducts();showToast(p.visible?'Produit visible dans la boutique.':'Produit masqué.');}}
    if(del){const p=products.find(p=>String(p.id)===del.dataset.delete);if(p&&confirm(`Supprimer « ${p.modele} » ? Cette action ne peut pas être annulée.`)){products=products.filter(x=>x.id!==p.id);saveProducts();showToast('Produit supprimé.');}}
  });
  function addVariantRow(data={c:'128 Go',p:0}){const row=document.createElement('div');row.className='variant-row variant-row-price-only';row.innerHTML=`<input data-v-field="c" aria-label="Capacité" placeholder="128 Go" value="${escapeHtml(data.c)}" required><input data-v-field="p" aria-label="Prix FCFA" type="number" min="0" step="500" placeholder="Prix FCFA" value="${Number(data.p)||0}" required><button type="button" class="remove-row" aria-label="Retirer cette capacité">×</button>`;row.querySelector('.remove-row').addEventListener('click',()=>{if($('variants-list').children.length>1)row.remove();else showToast('Gardez au moins une capacité.');});$('variants-list').appendChild(row);}
  function addColorRow(data={n:'Noir',h:'#222222'}){const row=document.createElement('div');row.className='color-row';row.innerHTML=`<input data-c-field="n" aria-label="Nom de la couleur" placeholder="Noir" value="${escapeHtml(data.n)}" required><input data-c-field="h" aria-label="Code couleur" type="text" pattern="^#([0-9a-fA-F]{6})$" placeholder="#222222" value="${escapeHtml(data.h)}" required><button type="button" class="remove-row" aria-label="Retirer cette couleur">×</button>`;row.querySelector('.remove-row').addEventListener('click',()=>{if($('colors-list').children.length>1)row.remove();else showToast('Gardez au moins une couleur.');});$('colors-list').appendChild(row);}
  function openProductForm(product=null){editingId=product?product.id:null;const f=$('product-form');f.reset();f.elements.id.value=product?product.id:'';$('product-dialog-title').textContent=product?'Modifier le téléphone':'Ajouter un téléphone';
    f.elements.modele.value=product?.modele||'';f.elements.marque.value=product?.marque||'';f.elements.cat.value=product?.cat||'android';f.elements.etat.value=product?.etat||'neuf';f.elements.image.value=product?.image||'';f.elements.desc.value=product?.desc||'';f.elements.nouveau.checked=!!product?.nouveau;f.elements.troc.checked=!!product?.troc;f.elements.visible.checked=product?product.visible!==false:true;
    $('variants-list').innerHTML='';(product?.cap?.length?product.cap:[{c:'128 Go',p:0}]).forEach(addVariantRow);$('colors-list').innerHTML='';(product?.col?.length?product.col:[{n:'Noir',h:'#222222'}]).forEach(addColorRow);$('product-dialog').showModal();
  }
  $('add-product').addEventListener('click',()=>openProductForm());$('add-variant').addEventListener('click',()=>addVariantRow({c:'',p:0}));$('add-color').addEventListener('click',()=>addColorRow({n:'',h:'#222222'}));
  function closeDialog(){$('product-dialog').close();} $('close-dialog').addEventListener('click',closeDialog);$('cancel-product').addEventListener('click',closeDialog);
  $('product-form').addEventListener('submit',e=>{e.preventDefault();const f=e.currentTarget;const cap=[...$('variants-list').querySelectorAll('.variant-row')].map(row=>({c:row.querySelector('[data-v-field="c"]').value.trim(),p:Math.max(0,Number(row.querySelector('[data-v-field="p"]').value)||0),s:99}));const col=[...$('colors-list').querySelectorAll('.color-row')].map(row=>({n:row.querySelector('[data-c-field="n"]').value.trim(),h:row.querySelector('[data-c-field="h"]').value.trim()}));if(!cap.length||cap.some(v=>!v.c)||!col.length||col.some(c=>!c.n||!/^#([0-9a-fA-F]{6})$/.test(c.h))){showToast('Vérifiez les capacités et les couleurs.');return;}
    const old=editingId?products.find(p=>p.id===editingId):null;const item={...(old||{}),id:old?old.id:Math.max(Date.now(), ...products.map(p => Number(p.id) || 0), 0),cat:f.elements.cat.value,marque:f.elements.marque.value.trim(),modele:f.elements.modele.value.trim(),etat:f.elements.etat.value,nouveau:f.elements.nouveau.checked,troc:f.elements.troc.checked,visible:f.elements.visible.checked,image:f.elements.image.value.trim(),desc:f.elements.desc.value.trim(),specs:old?.specs||{},cap,col};if(old){products=products.map(p=>p.id===old.id?item:p);}else products.unshift(item);saveProducts();closeDialog();showToast(old?'Produit modifié.':'Téléphone ajouté à la boutique.');
  });
  function fillSettings(){const f=$('settings-form');f.elements.storeName.value=settings.storeName||'MARO BRUTAF TECH';['wa','adresse','horaires','aproposTitre','aproposTexte','annonce','facebook','instagram'].forEach(k=>{if(f.elements[k])f.elements[k].value=settings[k]||'';});}
  $('settings-form').addEventListener('submit',e=>{e.preventDefault();const f=e.currentTarget;settings={...settings,storeName:f.elements.storeName.value.trim(),wa:f.elements.wa.value.trim(),adresse:f.elements.adresse.value.trim(),horaires:f.elements.horaires.value.trim(),aproposTitre:f.elements.aproposTitre.value.trim(),aproposTexte:f.elements.aproposTexte.value.trim(),annonce:f.elements.annonce.value.trim(),facebook:f.elements.facebook.value.trim(),instagram:f.elements.instagram.value.trim()};write(STORE_SETTINGS_KEY,settings);$('settings-feedback').textContent='Enregistré sur cet appareil.';showToast('Informations enregistrées.');setTimeout(()=>$('settings-feedback').textContent='',3500);});
  // Open the public shop after logout; the current static prototype uses localStorage shared by pages on the same origin.
  loadData(); if(sessionStorage.getItem('maro_admin_demo_session')==='1')showDashboard();
})();
