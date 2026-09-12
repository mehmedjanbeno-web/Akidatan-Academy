(()=>{
  const lessonTitle=l=>state.language==='ru'?`Урок ${l.number}`:l.title;

  const baseLessonCard=lessonCard;
  lessonCard=function(l){
    const original=l.title;
    l.title=lessonTitle({...l,title:original});
    try{
      let html=baseLessonCard(l);
      if(state.language==='ru'){
        html=html.replace(`<span class="badge">Урок ${l.number}</span>`,`<span class="badge">${original}</span>`);
      }
      return html;
    }finally{l.title=original}
  };

  const baseRenderLesson=renderLesson;
  renderLesson=function(){
    const l=lessons.find(x=>x.id===state.selectedLesson)||lessons[0];
    const original=l.title;
    l.title=lessonTitle({...l,title:original});
    try{baseRenderLesson()}finally{l.title=original}
  };
})();