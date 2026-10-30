(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const DEFAULT_SETTINGS = {id: 1, wa:'22662212122', adresse:'Koulouba, Ouagadougou', horaires:'Lun-Sam : 08h-20h', aproposTitre:'Votre expert mobile', aproposTexte:'Vente et Troc sécurisés.', annonce:'', facebook:'', instagram:''};
  
  let products = [], settings = {}, editingId = null, toastTimer = null;
  const escapeHtml = (v) => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&','<':'<','>':'>','"':'"',"'":'''}[c]));
  
  // 1. CHARGEMENT
  async function loadData() {
    const { data: dbProducts, error: errP } = await supabase.from('products').select('*').order('id', { ascending: false });
    if (!errP && dbProducts) {
      products = dbProducts.map(dbP => ({
        id: dbP.id,
        cat: dbP.category,
        marque: dbP.brand,
        modele: dbP.model,
        etat: dbP.condition_label,
        desc: dbP.description,
        image: dbP.image_url,
        specs: dbP.specs,
        cap: dbP.capacities,
        col: dbP.colors,
        nouveau: dbP.is_new,
        troc: dbP.trade_in,
        visible: dbP.is_visible
      }));
    } else { products = []; }

    const { data: dbSettings, error: errS } = await supabase.from('store_settings').select('*').single();
    if (!errS && dbSettings) {
      settings = {
        id: dbSettings.id,
        storeName: dbSettings.store_name,
        wa: dbSettings.whatsapp,
        adresse: dbSettings.address,
        horaires: dbSettings.opening_hours,
        aproposTitre: dbSettings.about_title,
        aproposTexte: dbSettings.about_text,
        annonce: dbSettings.announcement,
        facebook: dbSettings.facebook_url,
        instagram: dbSettings.instagram_url
      };
    } else {
      settings = { ...DEFAULT_SETTINGS };
    }
  }

  function showToast(message) { const el=$('toast'); el.textContent=message; el.classList.add('show'); clearTimeout(toastTimer); toastTimer=setTimeout(()=>el.classList.remove('show'),2500); }
  
  async function showDashboard() { 
    $('login-panel').hidden=true; 
    $('dashboard').hidden=false; 
    await loadData(); 
    renderProducts(); 
    renderStats(); 
    fillSettings(); 
  }

  async function logout() { 
      await supabase.auth.signOut();
      sessionStorage.removeItem('maro_admin_token'); 
      $('dashboard').hidden=true; 
      $('login-panel').hidden=false; 
      $('login-password').value=''; 
  }

  $('login-form').addEventListener('submit', async e => { 
      e.preventDefault(); 
      const email = $('login-email').value.trim().toLowerCase(); 
      const password = $('login-password').value; 
      
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
          $('login-error').textContent = "Erreur : " + error.message;
          $('login-error').hidden = false;
      } else {
          sessionStorage.setItem('maro_admin_token', data.session.access_token); 
          $('login-error').hidden = true; 
          showDashboard();
      } 
  });

  $('logout-button').addEventListener('click', logout);
  
  document.querySelectorAll('[data-tab]').forEach(button => button.addEventListener('click', () => { 
    document.querySelectorAll('[data-tab]').forEach(b=>b.classList.toggle('active',b===button)); 
    document.querySelectorAll('.tab-panel').forEach(p=>p.hidden=p.id!==`tab-${button.dataset.tab}`); 
  }));
  
  function renderStats(){ $('stat-products').textContent=products.length; $('stat-visible').textContent=products.filter(p=>p.visible!==false).length; }
  
  function renderProducts(){
    const list=$('product-list'); $('empty-products').hidden=products.length!==0;
    list.innerHTML=products.map(p=>{
      const image=p.image || '';
      const variants=(p.cap||[]).map((v,i)=>`<div class="variant-editor"><div class="variant-editor-top"><strong>${escapeHtml(v.c||'Standard')}</strong></div><div class="variant-fields variant-fields-single"><label>Prix (FCFA)<input type="number" min="0" step="500" data-price-id="${p.id}" data-variant="${i}" value="${Number(v.p)||0}" aria-label="Prix ${escapeHtml(v.c)}"></label></div></div>`).join('');
      return `<article class="product-card"><img class="product-image" src="${escapeHtml(image)}" alt="" onerror="this.onerror=null;this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 80 100%22%3E%3Crect width=%2280%22 height=%22100%22 fill=%22%23eee%22/%3E%3Ctext x=%2240%22 y=%2255%22 text-anchor=%22middle%22 font-size=%2228%22%3E📱%3C/text%3E%3C/svg%3E'"><div class="product-info"><div class="product-title-row"><div><h3 class="product-title">${escapeHtml(p.modele)}</h3><p class="product-subtitle">${escapeHtml(p.marque)} · ${escapeHtml(({neuf:'Neuf scellé',venue:'Très propre',occasion:'Occasion'})[p.etat]||'État non précisé')}</p></div><span class="status ${p.visible===false?'hidden-status':'visible'}">${p.visible===false?'Masqué':'Visible'}</span></div>${variants}<div class="product-actions"><button class="text-button" type="button" data-edit="${p.id}">✎ Modifier les informations</button><button class="text-button" type="button" data-toggle="${p.id}">${p.visible===false?'Afficher dans la boutique':'Masquer'}</button><button class="text-button danger" type="button" data-delete="${p.id}">Supprimer</button></div></div></article>`;
    }).join('');
  }

  $('product-list').addEventListener('change', async e => {
    const t=e.target; 
    if(t.dataset.priceId) {
      const p=products.find(x=>String(x.id)===t.dataset.priceId); 
      if(!p) return; 
      p.cap[Number(t.dataset.variant)].p = Math.max(0,Number(t.value)||0); 
      
      const { error } = await supabase.from('products').update({ capacities: p.cap }).eq('id', p.id);
      if(!error) { showToast('Prix enregistré sur Supabase.'); renderStats(); }
      else { showToast('Erreur Supabase (Sécurité RLS bloquée).'); }
    }
  });

  $('product-list').addEventListener('click', async e => {
    const edit=e.target.closest('[data-edit]'); const toggle=e.target.closest('[data-toggle]'); const del=e.target.closest('[data-delete]');
    if(edit) openProductForm(products.find(p=>String(p.id)===edit.dataset.edit));
    
    if(toggle){
      const p=products.find(p=>String(p.id)===toggle.dataset.toggle);
      if(p){
        p.visible = p.visible===false;
        const { error } = await supabase.from('products').update({ is_visible: p.visible }).eq('id', p.id);
        if(!error) {
          renderProducts(); renderStats();
          showToast(p.visible ? 'Produit visible dans la boutique.' : 'Produit masqué.');
        } else { showToast('Erreur de sécurité. Vérifie tes droits admin.'); }
      }
    }
    
    if(del){
      const p=products.find(p=>String(p.id)===del.dataset.delete);
      if(p && confirm(`Supprimer « ${p.modele} » ? Cette action ne peut pas être annulée.`)){
        const { error } = await supabase.from('products').delete().eq('id', p.id);
        if(!error) {
          products = products.filter(x=>x.id!==p.id);
          renderProducts(); renderStats();
          showToast('Produit supprimé.');
        } else { showToast('Erreur de sécurité lors de la suppression.'); }
      }
    }
  });

  function addVariantRow(data={c:'128 Go',p:0}){const row=document.createElement('div');row.className='variant-row variant-row-price-only';row.innerHTML=`<input data-v-field="c" aria-label="Capacité" placeholder="128 Go" value="${escapeHtml(data.c)}" required><input data-v-field="p" aria-label="Prix FCFA" type="number" min="0" step="500" placeholder="Prix FCFA" value="${Number(data.p)||0}" required><button type="button" class="remove-row" aria-label="Retirer cette capacité">×</button>`;row.querySelector('.remove-row').addEventListener('click',()=>{if($('variants-list').children.length>1)row.remove();else showToast('Gardez au moins une capacité.');});$('variants-list').appendChild(row);}
  function addColorRow(data={n:'Noir',h:'#222222'}){const row=document.createElement('div');row.className='color-row';row.innerHTML=`<input data-c-field="n" aria-label="Nom de la couleur" placeholder="Noir" value="${escapeHtml(data.n)}" required><input data-c-field="h" aria-label="Code couleur" type="text" pattern="^#([0-9a-fA-F]{6})$" placeholder="#222222" value="${escapeHtml(data.h)}" required><button type="button" class="remove-row" aria-label="Retirer cette couleur">×</button>`;row.querySelector('.remove-row').addEventListener('click',()=>{if($('colors-list').children.length>1)row.remove();else showToast('Gardez au moins une couleur.');});$('colors-list').appendChild(row);}
  
  function openProductForm(product=null){
    editingId=product?product.id:null;
    const f=$('product-form');f.reset();f.elements.id.value=product?product.id:'';
    $('product-dialog-title').textContent=product?'Modifier le téléphone':'Ajouter un téléphone';
    f.elements.modele.value=product?.modele||'';
    f.elements.marque.value=product?.marque||'';
    f.elements.cat.value=product?.cat||'android';
    f.elements.etat.value=product?.etat||'neuf';
    f.elements.image.value='';
    f.elements.image.required=!product;
    f.elements.desc.value=product?.desc||'';
    f.elements.nouveau.checked=!!product?.nouveau;
    f.elements.troc.checked=!!product?.troc;
    f.elements.visible.checked=product?product.visible!==false:true;
    $('variants-list').innerHTML='';(product?.cap?.length?product.cap:[{c:'128 Go',p:0}]).forEach(addVariantRow);
    $('colors-list').innerHTML='';(product?.col?.length?product.col:[{n:'Noir',h:'#222222'}]).forEach(addColorRow);
    $('product-dialog').showModal();
  }
  
  $('add-product').addEventListener('click',()=>openProductForm());
  $('add-variant').addEventListener('click',()=>addVariantRow({c:'',p:0}));
  $('add-color').addEventListener('click',()=>addColorRow({n:'',h:'#222222'}));
  
  function closeDialog(){$('product-dialog').close();} 
  $('close-dialog').addEventListener('click',closeDialog);
  $('cancel-product').addEventListener('click',closeDialog);
  
  // 2. SAUVEGARDE PRODUITS (Avec upload d'image)
  $('product-form').addEventListener('submit', async e => {
    e.preventDefault();
    const f=e.currentTarget;
    const submitBtn = f.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    
    const cap=[...$('variants-list').querySelectorAll('.variant-row')].map(row=>({c:row.querySelector('[data-v-field="c"]').value.trim(),p:Math.max(0,Number(row.querySelector('[data-v-field="p"]').value)||0),s:99}));
    const col=[...$('colors-list').querySelectorAll('.color-row')].map(row=>({n:row.querySelector('[data-c-field="n"]').value.trim(),h:row.querySelector('[data-c-field="h"]').value.trim()}));
    
    if(!cap.length||cap.some(v=>!v.c)||!col.length||col.some(c=>!c.n||!/^#([0-9a-fA-F]{6})$/.test(c.h))){showToast('Vérifiez les capacités et les couleurs.');return;}
    
    submitBtn.disabled = true;
    submitBtn.textContent = 'Téléversement...';

    try {
      const old=editingId?products.find(p=>p.id===editingId):null;
      
      // Gestion de l'image
      let imageUrl = old ? old.image : '';
      const imageFile = f.elements.image.files[0];
      
      if (imageFile) {
          const fileExt = imageFile.name.split('.').pop();
          const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage.from('product-images').upload(fileName, imageFile);
          if (uploadError) {
              showToast('Erreur upload : ' + uploadError.message);
              submitBtn.disabled = false;
              submitBtn.textContent = originalText;
              return;
          }
          
          const { data: publicUrlData } = supabase.storage.from('product-images').getPublicUrl(fileName);
          imageUrl = publicUrlData.publicUrl;
      }
      
      // Enregistrement BD
      const dbItem = {
        category: f.elements.cat.value,
        brand: f.elements.marque.value.trim(),
        model: f.elements.modele.value.trim(),
        condition_label: f.elements.etat.value,
        is_new: f.elements.nouveau.checked,
        trade_in: f.elements.troc.checked,
        is_visible: f.elements.visible.checked,
        image_url: imageUrl,
        description: f.elements.desc.value.trim(),
        specs: old?.specs||{},
        capacities: cap,
        colors: col
      };
      if(old) dbItem.id = old.id;

      const { error } = await supabase.from('products').upsert(dbItem);
      if(error) {
         showToast('Action bloquée par la sécurité : ' + error.message);
      } else {
         await loadData();
         renderProducts(); renderStats();
         closeDialog();
         showToast(old ? 'Produit modifié.' : 'Téléphone ajouté à la boutique.');
      }
    } catch (err) {
        showToast('Une erreur est survenue.');
        console.error(err);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
  });

  function fillSettings(){
    const f=$('settings-form');
    f.elements.storeName.value = settings.storeName || 'MARO BRUTAF TECH';
    ['wa','adresse','horaires','aproposTitre','aproposTexte','annonce','facebook','instagram'].forEach(k=>{
      if(f.elements[k]) f.elements[k].value = settings[k] || '';
    });
  }
  
  // 3. SAUVEGARDE PARAMÈTRES
  $('settings-form').addEventListener('submit', async e => {
    e.preventDefault();
    const f=e.currentTarget;
    
    const dbSettings = {
      id: 1,
      store_name: f.elements.storeName.value.trim(),
      whatsapp: f.elements.wa.value.trim(),
      address: f.elements.adresse.value.trim(),
      opening_hours: f.elements.horaires.value.trim(),
      about_title: f.elements.aproposTitre.value.trim(),
      about_text: f.elements.aproposTexte.value.trim(),
      announcement: f.elements.annonce.value.trim(),
      facebook_url: f.elements.facebook.value.trim(),
      instagram_url: f.elements.instagram.value.trim()
    };
    
    const { error } = await supabase.from('store_settings').upsert(dbSettings);
    if(error) {
       $('settings-feedback').textContent = 'Action bloquée par la sécurité : ' + error.message;
    } else {
       await loadData();
       $('settings-feedback').textContent = 'Enregistré sur Supabase.';
       showToast('Informations enregistrées.');
       setTimeout(()=>$('settings-feedback').textContent='',3500);
    }
  });
  
  if(sessionStorage.getItem('maro_admin_token')) showDashboard();
})();
