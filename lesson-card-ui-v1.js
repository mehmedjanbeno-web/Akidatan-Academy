(()=>{
  const heartSvg=(filled=false)=>filled
    ? `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.7 4.35 13.4A5.15 5.15 0 0 1 11.6 6.1L12 6.5l.4-.4a5.15 5.15 0 0 1 7.25 7.3Z" fill="currentColor" stroke="currentColor"/></svg>`
    : `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.7 4.35 13.4A5.15 5.15 0 0 1 11.6 6.1L12 6.5l.4-.4a5.15 5.15 0 0 1 7.25 7.3Z"/></svg>`;
  const lockSvg=()=>`<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5.5" y="10" width="13" height="10" rx="2.5"/><path d="M8.5 10V7.5a3.5 3.5 0 0 1 7 0V10"/></svg>`;
  const noteSvg=()=>`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3.5h9.5L19 7v13.5H6z"/><path d="M15.5 3.5V7H19M9 11h7M9 14.5h7M9 18h4.5"/></svg>`;
  const copySvg=()=>`<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="11" height="11" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></svg>`;
  const resizeSvg=()=>`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 11 11 20M20 15l-5 5M20 19l-1 1"/></svg>`;
  const NOTES_KEY='academy-lesson-notes-v1';
  const readNotes=()=>{try{return JSON.parse(localStorage.getItem(NOTES_KEY)||'{}')||{}}catch(_){return {}}};
  const writeNotes=notes=>localStorage.setItem(NOTES_KEY,JSON.stringify(notes));
  const isLessonLocked=l=>{
    const index=lessons.findIndex(x=>x.id===l.id);
    return index>0&&!state.completed.includes(lessons[index-1].id);
  };
  const noteText=()=>state.language==='ce'?{
    button:'Блокнот',help:'ЛадоьгӀучу хенахь ладаме ойланаш а, билгалдахарш а кхузахь дlаязде. ТӀетаӀае «Ӏалашдан», хӀокху гӀирса тӀехь уьш диса кхин дӀа а.',placeholder:'Билгалдахар кхузахь дӀаязде...',save:'Ӏалашдан',remove:'ДӀаяккха',saved:'Йоза Iалашдина',removed:'Йоза дӀадаьккхина',copy:'Шадерриг копировать де',copied:'Копировать дина',empty:'Блокнот ясса ю'
  }:{
    button:'Блокнот',help:'Записывайте здесь важные мысли и заметки во время прослушивания урока. Нажмите «Сохранить», чтобы запись осталась на этом устройстве.',placeholder:'Напишите заметку к этому уроку...',save:'Сохранить',remove:'Удалить запись',saved:'Запись сохранена',removed:'Запись удалена',copy:'Копировать всё',copied:'Скопировано',empty:'Блокнот пуст'
  };

  lessonCard=function(l){
    const fav=state.favorites.includes(l.id);
    const done=state.completed.includes(l.id);
    const locked=isLessonLocked(l);
    return `<article class="lesson-card lesson-card-v2 ${done?'completed':''} ${locked?'locked':''}" ${locked?'data-locked-lesson="'+l.id+'"':''}>
      <div class="lesson-card-main">
        <button class="lesson-open" data-lesson="${l.id}" ${locked?'aria-disabled="true"':''}>
          <span class="badge">${t('lesson')} ${l.number}</span>
          <h3>${l.title}</h3>
          <p class="lesson-audio-label">${t('audio')}</p>
        </button>
        <div class="lesson-card-actions">
          ${locked?`<span class="lesson-lock" aria-hidden="true">${lockSvg()}</span>`:`<button class="lesson-action-btn favorite-btn ${fav?'is-active':''}" data-favorite="${l.id}" aria-label="${fav?t('inFavorites'):t('toFavorites')}">${heartSvg(fav)}</button>`}
        </div>
      </div>
    </article>`;
  };

  const baseRenderLesson=renderLesson;
  renderLesson=function(){
    const lesson=lessons.find(x=>x.id===state.selectedLesson)||lessons[0];
    if(isLessonLocked(lesson)){state.route='courses';render();return}
    baseRenderLesson();
    const audioCard=document.querySelector('.lesson-screen .card');
    if(!audioCard||audioCard.querySelector('[data-note-toggle]'))return;
    const copy=noteText(),notes=readNotes(),noteValue=notes[lesson.id]||'',hasNote=Boolean(noteValue.trim());
    audioCard.insertAdjacentHTML('beforeend',`<div class="lesson-notes-wrap"><button class="lesson-note-toggle" type="button" data-note-toggle="${lesson.id}" aria-expanded="false">${noteSvg()}<span>${copy.button}</span></button><div class="lesson-note-panel" data-note-panel="${lesson.id}" hidden><p class="lesson-note-help" data-note-help="${lesson.id}" ${hasNote?'hidden':''}>${copy.help}</p><div class="lesson-note-editor"><textarea class="lesson-note-text" data-note-text="${lesson.id}" placeholder="${copy.placeholder}"></textarea><button class="lesson-note-resize" type="button" data-note-resize="${lesson.id}" aria-label="${state.language==='ce'?'Блокнотан барам хийца':'Изменить размер блокнота'}" title="${state.language==='ce'?'Блокнотан барам хийца':'Изменить размер блокнота'}">${resizeSvg()}</button></div><button class="secondary-btn lesson-note-copy" type="button" data-note-copy="${lesson.id}">${copySvg()}<span>${copy.copy}</span></button><div class="lesson-note-actions"><button class="primary-btn lesson-note-save" type="button" data-note-save="${lesson.id}">${copy.save}</button><button class="secondary-btn lesson-note-delete" type="button" data-note-delete="${lesson.id}" ${hasNote?'':'disabled'}>${copy.remove}</button></div></div></div>`);
    const textarea=audioCard.querySelector(`[data-note-text="${lesson.id}"]`);if(textarea)textarea.value=noteValue;
  };

  function syncWritingMode(id){const textarea=document.querySelector(`[data-note-text="${id}"]`),help=document.querySelector(`[data-note-help="${id}"]`),toggle=document.querySelector(`[data-note-toggle="${id}"]`);if(!textarea)return;const hasText=Boolean(textarea.value.trim());if(help)help.hidden=hasText;if(toggle)toggle.hidden=hasText}
  function closeNote(id){const panel=document.querySelector(`[data-note-panel="${id}"]`),toggle=document.querySelector(`[data-note-toggle="${id}"]`);if(panel)panel.hidden=true;if(toggle){toggle.hidden=false;toggle.setAttribute('aria-expanded','false')}}
  async function copyNote(id){const textarea=document.querySelector(`[data-note-text="${id}"]`);if(!textarea)return;const text=textarea.value;if(!text.trim()){toast(noteText().empty);return}try{if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(text)}else{textarea.focus();textarea.select();document.execCommand('copy');textarea.setSelectionRange(text.length,text.length)}toast(noteText().copied);haptic()}catch(_){textarea.focus();textarea.select();try{document.execCommand('copy');toast(noteText().copied);haptic()}catch(__){}}}

  let resizeState=null;
  function resizeMove(clientY){if(!resizeState)return;const next=Math.max(180,Math.min(620,resizeState.startHeight+(clientY-resizeState.startY)));resizeState.textarea.style.height=`${next}px`}
  function stopResize(){if(!resizeState)return;document.body.classList.remove('note-resizing');resizeState=null}
  document.addEventListener('pointerdown',e=>{const handle=e.target.closest('[data-note-resize]');if(!handle)return;e.preventDefault();e.stopPropagation();const textarea=document.querySelector(`[data-note-text="${handle.dataset.noteResize}"]`);if(!textarea)return;resizeState={textarea,startY:e.clientY,startHeight:textarea.getBoundingClientRect().height};document.body.classList.add('note-resizing');try{handle.setPointerCapture(e.pointerId)}catch(_){}},true);
  document.addEventListener('pointermove',e=>{if(resizeState){e.preventDefault();resizeMove(e.clientY)}},true);
  document.addEventListener('pointerup',stopResize,true);document.addEventListener('pointercancel',stopResize,true);
  document.addEventListener('input',e=>{const textarea=e.target.closest('[data-note-text]');if(textarea)syncWritingMode(textarea.dataset.noteText)},true);

  document.addEventListener('click',e=>{
    const locked=e.target.closest('[data-locked-lesson]');if(locked){e.preventDefault();e.stopPropagation();haptic();return}
    const toggle=e.target.closest('[data-note-toggle]');if(toggle){const id=toggle.dataset.noteToggle,panel=document.querySelector(`[data-note-panel="${id}"]`);if(panel){panel.hidden=!panel.hidden;toggle.setAttribute('aria-expanded',String(!panel.hidden));if(!panel.hidden){panel.querySelector('textarea')?.focus();syncWritingMode(id)}}haptic();return}
    const copyBtn=e.target.closest('[data-note-copy]');if(copyBtn){copyNote(copyBtn.dataset.noteCopy);return}
    const saveBtn=e.target.closest('[data-note-save]');if(saveBtn){const id=saveBtn.dataset.noteSave,textarea=document.querySelector(`[data-note-text="${id}"]`);if(!textarea)return;const notes=readNotes();notes[id]=textarea.value;writeNotes(notes);const del=document.querySelector(`[data-note-delete="${id}"]`);if(del)del.disabled=!textarea.value.trim();closeNote(id);toast(noteText().saved);haptic();return}
    const deleteBtn=e.target.closest('[data-note-delete]');if(deleteBtn){const id=deleteBtn.dataset.noteDelete,notes=readNotes();delete notes[id];writeNotes(notes);const textarea=document.querySelector(`[data-note-text="${id}"]`);if(textarea)textarea.value='';syncWritingMode(id);deleteBtn.disabled=true;closeNote(id);toast(noteText().removed);haptic()}
  },true);
  render();
})();
