(()=>{
  const heartSvg=(filled=false)=>filled
    ? `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.7 4.35 13.4A5.15 5.15 0 0 1 11.6 6.1L12 6.5l.4-.4a5.15 5.15 0 0 1 7.25 7.3Z" fill="currentColor" stroke="currentColor"/></svg>`
    : `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.7 4.35 13.4A5.15 5.15 0 0 1 11.6 6.1L12 6.5l.4-.4a5.15 5.15 0 0 1 7.25 7.3Z"/></svg>`;

  const noteSvg=()=>`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3.5h9.5L19 7v13.5H6z"/><path d="M15.5 3.5V7H19M9 11h7M9 14.5h7M9 18h4.5"/></svg>`;
  const NOTES_KEY='academy-lesson-notes-v1';

  const readNotes=()=>{
    try{return JSON.parse(localStorage.getItem(NOTES_KEY)||'{}')||{}}catch(_){return {}}
  };
  const writeNotes=notes=>localStorage.setItem(NOTES_KEY,JSON.stringify(notes));
  const noteText=()=>state.language==='ce'?{
    button:'Блокнот',
    title:'Блокнот урока',
    help:'ЛадоьгӀучу хенахь ладаме ойланаш а, билгалдахарш а кхузахь дӀаяздаде. ТӀетаӀае «Ӏалашдан», хӀокху гӀирса тӀехь уьш диса кхин дӀа а.',
    placeholder:'Билгалдахар кхузахь дӀаязде...',
    save:'Ӏалашдан',
    remove:'ДӀадаккха',
    saved:'Ӏалашдина',
    removed:'ДӀадаьккхина'
  }:{
    button:'Блокнот',
    title:'Блокнот урока',
    help:'Записывайте здесь важные мысли и заметки во время прослушивания урока. Нажмите «Сохранить», чтобы запись осталась на этом устройстве.',
    placeholder:'Напишите заметку к этому уроку...',
    save:'Сохранить',
    remove:'Удалить запись',
    saved:'Запись сохранена',
    removed:'Запись удалена'
  };

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
        </div>
      </div>
    </article>`;
  };

  const baseRenderLesson=renderLesson;
  renderLesson=function(){
    baseRenderLesson();
    const lesson=lessons.find(x=>x.id===state.selectedLesson)||lessons[0];
    const audioCard=document.querySelector('.lesson-screen .card');
    if(!audioCard||audioCard.querySelector('[data-note-toggle]'))return;

    const copy=noteText();
    const notes=readNotes();
    const hasNote=Boolean((notes[lesson.id]||'').trim());
    audioCard.insertAdjacentHTML('beforeend',`
      <div class="lesson-notes-wrap">
        <button class="lesson-note-toggle" type="button" data-note-toggle="${lesson.id}" aria-expanded="false">
          ${noteSvg()}<span>${copy.button}</span>
        </button>
        <div class="lesson-note-panel" data-note-panel="${lesson.id}" hidden>
          <div class="lesson-note-title">${copy.title}</div>
          <p class="lesson-note-help">${copy.help}</p>
          <textarea class="lesson-note-text" data-note-text="${lesson.id}" placeholder="${copy.placeholder}"></textarea>
          <div class="lesson-note-actions">
            <button class="primary-btn lesson-note-save" type="button" data-note-save="${lesson.id}">${copy.save}</button>
            <button class="secondary-btn lesson-note-delete" type="button" data-note-delete="${lesson.id}" ${hasNote?'':'disabled'}>${copy.remove}</button>
          </div>
        </div>
      </div>`);

    const textarea=audioCard.querySelector(`[data-note-text="${lesson.id}"]`);
    if(textarea)textarea.value=notes[lesson.id]||'';
  };

  function closeNote(id){
    const panel=document.querySelector(`[data-note-panel="${id}"]`);
    const toggle=document.querySelector(`[data-note-toggle="${id}"]`);
    if(panel)panel.hidden=true;
    if(toggle)toggle.setAttribute('aria-expanded','false');
  }

  document.addEventListener('click',e=>{
    const toggle=e.target.closest('[data-note-toggle]');
    if(toggle){
      const panel=document.querySelector(`[data-note-panel="${toggle.dataset.noteToggle}"]`);
      if(panel){
        panel.hidden=!panel.hidden;
        toggle.setAttribute('aria-expanded',String(!panel.hidden));
        if(!panel.hidden)panel.querySelector('textarea')?.focus();
      }
      haptic();
      return;
    }

    const saveBtn=e.target.closest('[data-note-save]');
    if(saveBtn){
      const id=saveBtn.dataset.noteSave;
      const textarea=document.querySelector(`[data-note-text="${id}"]`);
      if(!textarea)return;
      const notes=readNotes();
      notes[id]=textarea.value;
      writeNotes(notes);
      const del=document.querySelector(`[data-note-delete="${id}"]`);
      if(del)del.disabled=!textarea.value.trim();
      closeNote(id);
      toast(noteText().saved);
      haptic();
      return;
    }

    const deleteBtn=e.target.closest('[data-note-delete]');
    if(deleteBtn){
      const id=deleteBtn.dataset.noteDelete;
      const notes=readNotes();
      delete notes[id];
      writeNotes(notes);
      const textarea=document.querySelector(`[data-note-text="${id}"]`);
      if(textarea)textarea.value='';
      deleteBtn.disabled=true;
      closeNote(id);
      toast(noteText().removed);
      haptic();
    }
  },true);

  render();
})();