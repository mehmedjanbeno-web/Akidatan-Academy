(()=>{
  const heartSvg=(filled=false)=>filled
    ? `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.7 4.35 13.4A5.15 5.15 0 0 1 11.6 6.1L12 6.5l.4-.4a5.15 5.15 0 0 1 7.25 7.3Z" fill="currentColor" stroke="currentColor"/></svg>`
    : `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.7 4.35 13.4A5.15 5.15 0 0 1 11.6 6.1L12 6.5l.4-.4a5.15 5.15 0 0 1 7.25 7.3Z"/></svg>`;

  const downloadSvg=()=>`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v11m0 0 4-4m-4 4-4-4M5 18v2h14v-2"/></svg>`;

  lessonCard=function(l){
    const fav=state.favorites.includes(l.id);
    const done=state.completed.includes(l.id);
    return `<article class="lesson-card lesson-card-v2 ${done?'completed':''}">
      <div class="lesson-card-main">
        <button class="lesson-open" data-lesson="${l.id}">
          <span class="badge">${t('lesson')} ${l.number}</span>
          <h3>${l.title}</h3>
          <p class="lesson-audio-label">${t('audio')}</p>
        </button>
        <div class="lesson-card-actions">
          <button class="lesson-action-btn favorite-btn ${fav?'is-active':''}" data-favorite="${l.id}" aria-label="${fav?t('inFavorites'):t('toFavorites')}">${heartSvg(fav)}</button>
          <button class="lesson-action-btn download-audio-btn" data-download-audio="${l.id}" aria-label="Скачать аудио" title="Скачать аудио">${downloadSvg()}</button>
        </div>
      </div>
    </article>`;
  };

  async function downloadAudio(id,button){
    const lesson=lessons.find(x=>x.id===id);
    if(!lesson||button?.dataset.busy==='1')return;
    if(button){button.dataset.busy='1';button.classList.add('is-busy')}
    try{
      const r=await fetch(lesson.audio);
      if(!r.ok)throw new Error(`HTTP ${r.status}`);
      const blob=await r.blob();
      const type=(blob.type||'').toLowerCase();
      const ext=type.includes('mpeg')?'mp3':type.includes('mp4')?'m4a':type.includes('ogg')?'ogg':'mp3';
      const url=URL.createObjectURL(blob);
      const a=document.createElement('a');
      a.href=url;
      a.download=`${lesson.title}.${ext}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(()=>URL.revokeObjectURL(url),1500);
      haptic();
    }catch(e){
      console.warn('Audio download:',e);
      window.open(lesson.audio,'_blank','noopener');
    }finally{
      if(button){delete button.dataset.busy;button.classList.remove('is-busy')}
    }
  }

  document.addEventListener('click',e=>{
    const button=e.target.closest('[data-download-audio]');
    if(!button)return;
    e.preventDefault();
    e.stopPropagation();
    downloadAudio(button.dataset.downloadAudio,button);
  },true);

  render();
})();