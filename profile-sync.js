(()=>{
  const initData=window.Telegram?.WebApp?.initData||'';
  const tgUser=window.Telegram?.WebApp?.initDataUnsafe?.user||null;
  let profile=null;
  let profilePhoto='';
  let ready=false;
  let timer=null;

  async function api(path,body){
    const r=await fetch(`${API}${path}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
    if(!r.ok)throw new Error(`Profile API ${r.status}`);
    return r.json();
  }

  async function loadPhoto(){
    if(!initData)return;
    try{
      const r=await fetch(`${API}/profile/photo`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({init_data:initData})});
      if(!r.ok)return;
      const blob=await r.blob();
      if(!blob.size)return;
      if(profilePhoto.startsWith('blob:'))URL.revokeObjectURL(profilePhoto);
      profilePhoto=URL.createObjectURL(blob);
      if(state.route==='profile')render();
    }catch(e){console.warn('Profile photo:',e)}
  }

  function localPayload(){
    return {init_data:initData,completed:state.completed,favorites:state.favorites,language:state.language,theme:state.theme,font_scale:state.fontScale};
  }

  async function push(){
    if(!initData||!ready)return;
    try{await api('/profile/save',localPayload())}catch(e){console.warn('Profile sync:',e)}
  }

  function schedulePush(){
    clearTimeout(timer);
    timer=setTimeout(push,250);
  }

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
    const photo=profilePhoto||user.photo_url||'';
    const avatar=photo?`<img src="${escapeHtml(photo)}" alt="" style="width:72px;height:72px;border-radius:50%;object-fit:cover;flex:0 0 72px">`:`<div class="avatar">${escapeHtml((user.first_name||'ӀА').slice(0,2))}</div>`;
    card.innerHTML=`${avatar}<div><h3 style="margin:0">${escapeHtml(name)}</h3>${username?`<p style="margin:5px 0 0;color:var(--muted)">${escapeHtml(username)}</p>`:''}<p style="margin:5px 0 0;color:var(--muted)">${t('academyStudent')}</p></div>`;
  };

  async function start(){
    if(!initData)return;
    try{
      const data=await api('/profile/load',{init_data:initData});
      profile=data.profile;
      if(data.is_new){
        ready=true;
        await push();
      }else{
        state.completed=Array.isArray(profile.completed)?profile.completed:[];
        state.favorites=Array.isArray(profile.favorites)?profile.favorites:[];
        state.language=profile.language==='ru'?'ru':'ce';
        state.theme=profile.theme==='dark'?'dark':'light';
        state.fontScale=Number(profile.font_scale)||1;
        document.documentElement.dataset.theme=state.theme;
        localSave();
        ready=true;
      }
      render();
      loadPhoto();
    }catch(e){console.warn('Profile load:',e)}
  }

  start();
})();
