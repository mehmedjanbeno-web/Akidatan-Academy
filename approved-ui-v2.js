(()=>{
  const courseHeader=()=>{
    const c=courses[0];
    return `<section class="approved-page-head"><div><div class="approved-page-kicker">${c.title}</div><div class="approved-page-sub">${c.lessons.length} ${t('lessons')}</div></div><a class="approved-pdf" href="${c.pdf}" target="_blank" rel="noopener">PDF</a></section>`;
  };

  renderHome=function(){
    title.textContent=t('home');
    const p=progressValue();
    const done=state.completed.filter(id=>lessons.some(l=>l.id===id)).length;
    view.innerHTML=`
      <section class="hero approved-home-hero">
        <h2>Ӏакъидатан Академия</h2>
        <p>${t('course')} 1 · 20 ${t('lessons')}</p>
        <button class="primary-btn" data-action="continue">${t('continueStudy')} <span aria-hidden="true">›</span></button>
      </section>
      <section class="approved-quick-grid">
        <button class="approved-quick-card" data-route-btn="courses"><span class="approved-quick-icon">◇</span><strong>${t('courses')}</strong><small>${t('allSections')}</small></button>
        <button class="approved-quick-card" data-route-btn="search"><span class="approved-quick-icon">⌕</span><strong>${t('search')}</strong><small>${t('findLesson')}</small></button>
        <button class="approved-quick-card" data-route-btn="favorites"><span class="approved-quick-icon">♡</span><strong>${t('favorites')}</strong><small>${t('savedLessons')}</small></button>
        <button class="approved-quick-card" data-route-btn="progress"><span class="approved-quick-icon">◎</span><strong>${t('progress')}</strong><small>${t('track')}</small></button>
      </section>
      <section class="approved-home-progress">
        <div class="approved-progress-head"><strong>${t('myProgress')}</strong><button class="approved-more" data-route-btn="progress">${t('more')}</button></div>
        <div class="approved-progress-card"><div class="progress-row"><span>${t('lessonsDone')}</span><strong>${done}/${lessons.length}</strong></div><div class="progress-track"><div class="progress-fill" style="width:${p}%"></div></div><small>${p}% ${t('finished')}</small></div>
      </section>`;
  };

  renderCourses=function(){
    title.textContent=t('courses');
    view.innerHTML=`${courseHeader()}<section class="approved-lesson-list">${lessons.map(lessonCard).join('')}</section>`;
  };

  renderCourse=function(){
    title.textContent=courses[0].title;
    view.innerHTML=`${courseHeader()}<section class="approved-lesson-list">${lessons.map(lessonCard).join('')}</section>`;
  };

  const oldRenderLesson=renderLesson;
  renderLesson=function(){
    const l=lessons.find(x=>x.id===state.selectedLesson)||lessons[0];
    const idx=lessons.indexOf(l),fav=state.favorites.includes(l.id),done=state.completed.includes(l.id);
    title.textContent=l.title;
    view.innerHTML=`<div class="lesson-screen approved-lesson-screen">
      <section class="approved-lesson-title"><button class="approved-back" data-back="courses" aria-label="Назад">‹</button><div><small>${t('lesson')} ${l.number}</small><h2>${l.title}</h2></div></section>
      <section class="approved-player-card"><div class="approved-player-label">${t('lessonAudio')}</div><audio controls preload="metadata" src="${l.audio}"></audio></section>
      <section class="approved-lesson-actions"><button class="secondary-btn" data-favorite="${l.id}">${fav?'♥ '+t('inFavorites'):'♡ '+t('toFavorites')}</button><button class="secondary-btn" data-complete="${l.id}">${done?'✓ '+t('lessonDone'):t('markDone')}</button></section>
      <section class="approved-lesson-nav"><button class="secondary-btn" ${idx===0?'disabled':''} data-prev="${idx-1}">${t('previous')}</button><button class="secondary-btn" ${idx===lessons.length-1?'disabled':''} data-next="${idx+1}">${t('next')}</button></section>
    </div>`;
  };

  renderFavorites=function(){
    title.textContent=t('favorites');
    const favs=lessons.filter(l=>state.favorites.includes(l.id));
    view.innerHTML=favs.length?`<section class="approved-lesson-list">${favs.map(lessonCard).join('')}</section>`:`<section class="approved-empty"><div class="approved-empty-heart">♡</div><h2>${t('empty')}</h2><p>${t('emptyFavorites')}</p></section>`;
  };

  renderProgress=function(){
    title.textContent=t('progress');
    const p=progressValue(),done=lessons.filter(l=>state.completed.includes(l.id));
    view.innerHTML=`<section class="approved-progress-page"><div class="approved-progress-head"><strong>${t('myProgress')}</strong><span>${p}%</span></div><div class="approved-progress-card"><div class="progress-row"><span>${t('lessonsDone')}</span><strong>${done.length}/${lessons.length}</strong></div><div class="progress-track"><div class="progress-fill" style="width:${p}%"></div></div><small>${p}% ${t('finished')}</small></div>${done.length?`<section class="approved-lesson-list">${done.map(lessonCard).join('')}</section>`:''}</section>`;
  };

  render();
})();