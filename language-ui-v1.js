(()=>{
  const lessonTitle=l=>state.language==='ru'?`Урок ${l.number}`:l.title;

  const baseLessonCard=lessonCard;
  lessonCard=function(l){
    const original=l.title;
    const displayLesson={...l,title:lessonTitle(l)};
    let html=baseLessonCard(displayLesson);
    if(state.language==='ru'){
      html=html.replace(/<span class="badge">[\s\S]*?<\/span>/,`<span class="badge">${original}</span>`);
    }
    return html;
  };

  const baseRenderLesson=renderLesson;
  renderLesson=function(){
    const l=lessons.find(x=>x.id===state.selectedLesson)||lessons[0];
    const original=l.title;
    if(state.language!=='ru'){baseRenderLesson();return}
    l.title=`Урок ${l.number}`;
    try{baseRenderLesson()}finally{l.title=original}
  };
})();