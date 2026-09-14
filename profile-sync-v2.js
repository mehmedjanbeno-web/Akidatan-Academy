(()=>{
  const initData=window.Telegram?.WebApp?.initData||'';
  const tgUser=window.Telegram?.WebApp?.initDataUnsafe?.user||null;
  let profile=null;
  let profilePhoto='';
  let ready=false;
  let timer=null;
  const SEQUENTIAL_MIGRATION_KEY='academy-sequential-v1-ready';

  async function api(path,body){
    const r=await fetch(`${API}${path}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
    if(!r.ok)throw new Error(`Profile API ${r.status}`);
    return r.json();
  }

  function setPhotoBlob(blob){
    if(!blob||!blob.size)return false;
    if(profilePhoto.startsWith('blob:'))URL.revokeObjectURL(profilePhoto);
    profilePhoto=URL.createObjectURL(blob);
    if(state.route==='profile')render();
    return true;
  }

  async function loadCustomAvatar(){
    if(!initData)return false;
    try{
      const r=await fetch(`${API}/profile/avatar/get`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({init_data:initData})});
      if(!r.ok)return false;
      return setPhotoBlob(await r.blob());
    }catch(e){console.warn('Custom avatar:',e);return false}
  }

  async function loadTelegramPhoto(){
    if(!initData)return;
    try{
      const r=await fetch(`${API}/profile/photo`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({init_data:initData})});
      if(!r.ok)return;
      setPhotoBlob(await r.blob());
    }catch(e){console.warn('Profile photo:',e)}
  }

  function imageToDataUrl(file){
    return new Promise((resolve,reject)=>{
      const img=new Image();
      const url=URL.createObjectURL(file);
      img.onload=()=>{
        try{
          const size=Math.min(img.naturalWidth,img.naturalHeight);
          const sx=Math.max(0,(img.naturalWidth-size)/2);
          const sy=Math.max(0,(img.naturalHeight-size)/2);
          const canvas=document.createElement('canvas');
          canvas.width=512;canvas.height=512;
          const ctx=canvas.getContext('2d');
          ctx.drawImage(img,sx,sy,size,size,0,0,512,512);
          URL.revokeObjectURL(url);
          resolve(canvas.toDataURL('image/jpeg',.86));
        }catch(e){URL.revokeObjectURL(url);reject(e)}
      };
      img.onerror=()=>{URL.revokeObjectURL(url);reject(new Error('image'))};
      img.src=url;
    });
  }

  async function uploadAvatar(file){
    if(!file||!initData)return;
    try{
      const image=await imageToDataUrl(file);
      await api('/profile/avatar',{init_data:initData,image});
      await loadCustomAvatar();
      haptic();
    }catch(e){console.warn('Avatar upload:',e)}
  }

  function localPayload(){
    return {init_data:initData,completed:state.completed,favorites:state.favorites,language:state.language,theme:state.theme,font_scale:state.fontScale};
  }

  async function push(){
    if(!initData||!ready)return;
    try{await api('/profile/save',localPayload())}catch(e){console.warn('Profile sync:',e)}
  }

  function schedulePush(){clearTimeout(timer);timer=setTimeout(push,250)}

  const localSave=save;
  save=function(){localSave();schedulePush()};

  const baseRenderProfile=renderProfile;
  renderProfile=function(){
    baseRenderProfile();
    const user=profile||tgUser;
    if(!user)return;
    const card=view.querySelector('.profile-row');
    if(!card)return;
    const name=[user.first_name,user.last_name].filter(Boolean).join(' ')||'Telegram';
    const username=user.username?`@${user.username}`:'';
    const hasPhoto=Boolean(profilePhoto||user.photo_url);
    const photo=profilePhoto||user.photo_url||'';
    const initials=(user.first_name||'ӀА').slice(0,2);
    const avatarInner=hasPhoto?`<img src="${escapeHtml(photo)}" alt="" style="width:72px;height:72px;border-radius:50%;object-fit:cover;display:block">`:`<div class="avatar" style="margin:0">${escapeHtml(initials)}</div>`;
    const cameraBadge=hasPhoto?'':`<span aria-hidden="true" style="position:absolute;right:-3px;bottom:-3px;width:27px;height:27px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:var(--gold);color:#17382f;font-size:14px;border:2px solid var(--surface)">📷</span>`;
    const dark=state.theme==='dark';
    const themeLabel=dark?t('enableLight'):t('enableDark');
    const themeIcon=dark
      ? `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4.5" fill="currentColor"/><path d="M12 2.5v2M12 19.5v2M4.58 4.58l1.42 1.42M18 18l1.42 1.42M2.5 12h2M19.5 12h2M4.58 19.42L6 18M18 6l1.42-1.42" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`
      : `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 15.4A8.5 8.5 0 0 1 8.6 4a8.7 8.7 0 1 0 11.4 11.4Z" fill="currentColor"/></svg>`;
    card.innerHTML=`<button type="button" class="profile-theme-btn" data-theme-profile aria-label="${escapeHtml(themeLabel)}" title="${escapeHtml(themeLabel)}"><span class="theme-symbol" aria-hidden="true">${themeIcon}</span></button><button type="button" data-avatar-picker style="position:relative;width:72px;height:72px;flex:0 0 72px;padding:0;border:0;background:transparent;border-radius:50%;overflow:visible;cursor:pointer">${avatarInner}${cameraBadge}</button><input data-avatar-input type="file" accept="image/jpeg,image/png,image/webp" hidden><div><h3 style="margin:0">${escapeHtml(name)}</h3>${username?`<p style="margin:5px 0 0;color:var(--muted)">${escapeHtml(username)}</p>`:''}<p style="margin:5px 0 0;color:var(--muted)">${t('academyStudent')}</p></div>`;
    const themeButton=card.querySelector('[data-theme-profile]');
    themeButton?.addEventListener('click',()=>{
      state.theme=state.theme==='dark'?'light':'dark';
      document.documentElement.dataset.theme=state.theme;
      save();
      render();
      haptic();
    });
    const picker=card.querySelector('[data-avatar-picker]');
    const input=card.querySelector('[data-avatar-input]');
    picker?.addEventListener('click',()=>input?.click());
    input?.addEventListener('change',()=>uploadAvatar(input.files?.[0]));
  };

  async function start(){
    if(!initData)return;
    try{
      const data=await api('/profile/load',{init_data:initData});
      profile=data.profile;
      if(data.is_new){
        state.theme='dark';
        state.fontScale=.9;
        state.completed=[];
        document.documentElement.dataset.theme='dark';
        localStorage.setItem(SEQUENTIAL_MIGRATION_KEY,'1');
        localSave();
        ready=true;
        await push();
      }else{
        state.completed=Array.isArray(profile.completed)?profile.completed:[];
        state.favorites=Array.isArray(profile.favorites)?profile.favorites:[];
        state.language=profile.language==='ru'?'ru':'ce';
        state.theme=profile.theme==='light'?'light':'dark';
        state.fontScale=Number(profile.font_scale)||.9;
        document.documentElement.dataset.theme=state.theme;
        const needsSequentialReset=!localStorage.getItem(SEQUENTIAL_MIGRATION_KEY);
        if(needsSequentialReset){
          state.completed=[];
          localStorage.setItem(SEQUENTIAL_MIGRATION_KEY,'1');
        }
        localSave();
        ready=true;
        if(needsSequentialReset)await push();
      }
      render();
      const custom=await loadCustomAvatar();
      if(!custom)await loadTelegramPhoto();
    }catch(e){console.warn('Profile load:',e)}
  }

  start();
})();
