(()=>{
  const heartSvg=(filled=false)=>filled
    ? `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.7 4.35 13.4A5.15 5.15 0 0 1 11.6 6.1L12 6.5l.4-.4a5.15 5.15 0 0 1 7.25 7.3Z" fill="currentColor" stroke="currentColor"/></svg>`
    : `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.7 4.35 13.4A5.15 5.15 0 0 1 11.6 6.1L12 6.5l.4-.4a5.15 5.15 0 0 1 7.25 7.3Z"/></svg>`;

  const noteSvg=()=>`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3.5h9.5L19 7v13.5H6z"/><path d="M15.5 3.5V7H19M9 11h7M9 14.5h7M9 18h4.5"/></svg>`;

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
          <button class="lesson-action-btn lesson-note-btn" data-lesson-note="${l.id}" aria-label="Блокнот" title="Блокнот">${noteSvg()}</button>
        </div>
      </div>
    </article>`;
  };

  document.addEventListener('click',e=>{
    const button=e.target.closest('[data-lesson-note]');
    if(!button)return;
    e.preventDefault();
    e.stopPropagation();
    const lesson=lessons.find(x=>x.id===button.dataset.lessonNote);
    if(!lesson)return;
    state.selectedLesson=lesson.id;
    state.route='lesson';
    render();
    haptic();
  },true);

  render();
})();