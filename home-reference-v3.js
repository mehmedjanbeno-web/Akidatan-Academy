(()=>{
  const menuSvg='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>';
  const icon=(type)=>({courses:'▤',search:'⌕',favorites:'♡',progress:'◎'}[type]||'◇');

  renderHome=function(){
    title.textContent=t('home');
    const p=progressValue();
    const done=state.completed.filter(id=>lessons.some(l=>l.id===id)).length;
    const motto=state.language==='ce'?'Iилмано АллахIана гергавоьху':'Знание приближает к Аллаху';

    view.innerHTML=`
      <section class="ref-home-hero">
        <div class="ref-home-pattern" aria-hidden="true"></div>
        <button class="ref-home-menu" type="button" data-ref-menu aria-label="Открыть меню">${menuSvg}</button>
        <div class="ref-home-emblem">
          <img src="https://t.me/i/userpic/320/AkidatanAcademyAppBot.jpg?v=2" alt="Ӏакъидатан Академия">
        </div>
        <h2>ӀАКЪИДАТАН<br>АКАДЕМИЯ</h2>
        <p class="ref-home-motto">${motto}</p>
        <div class="ref-home-ornament" aria-hidden="true"><span></span><b>◇</b><span></span></div>
        <p class="ref-home-course">${t('course')} 1 · 20 ${t('lessons')}</p>
        <button class="ref-home-primary" data-action="continue">${t('continueStudy')} <span aria-hidden="true">›</span></button>
      </section>

      <section class="ref-home-grid" aria-label="${t('quick')}">
        <button class="ref-home-card" data-route-btn="courses"><span class="ref-home-icon">${icon('courses')}</span><strong>${t('courses')}</strong><small>${t('allSections')}</small></button>
        <button class="ref-home-card" data-route-btn="search"><span class="ref-home-icon">${icon('search')}</span><strong>${t('search')}</strong><small>${t('findLesson')}</small></button>
        <button class="ref-home-card" data-route-btn="favorites"><span class="ref-home-icon">${icon('favorites')}</span><strong>${t('favorites')}</strong><small>${t('savedLessons')}</small></button>
        <button class="ref-home-card" data-route-btn="progress"><span class="ref-home-icon">${icon('progress')}</span><strong>${t('progress')}</strong><small>${t('track')}</small></button>
      </section>

      <section class="ref-home-progress">
        <div class="ref-home-progress-title"><strong>${t('myProgress')}</strong><button data-route-btn="progress">${t('more')}</button></div>
        <div class="ref-home-progress-card">
          <div><span>${t('lessonsDone')}</span><strong>${done}/${lessons.length}</strong></div>
          <div class="progress-track"><div class="progress-fill" style="width:${p}%"></div></div>
          <small>${p}% ${t('finished')}</small>
        </div>
      </section>`;
  };

  document.addEventListener('click',e=>{
    const btn=e.target.closest('[data-ref-menu]');
    if(!btn)return;
    e.preventDefault();
    e.stopPropagation();
    document.getElementById('side-menu-toggle')?.click();
  },true);

  if(state.route==='home') render();
})();