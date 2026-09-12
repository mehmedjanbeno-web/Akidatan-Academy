(()=>{
  function backLabel(){return state.language==='ce'?'Йух вала':'Назад'}
  function homeLabel(){return state.language==='ce'?'Коьрте йух вал':'Главный экран'}

  function applySectionNavigation(){
    const view=document.getElementById('view');
    if(!view||state.route==='home')return;

    const existingBack=view.querySelector(':scope > .link-btn[data-back]');
    if(existingBack){
      existingBack.textContent=`← ${backLabel()}`;
      return;
    }

    if(['courses','search','favorites','progress','profile'].includes(state.route)){
      if(view.querySelector(':scope > .section-home-btn'))return;
      const button=document.createElement('button');
      button.className='link-btn section-home-btn';
      button.dataset.back='home';
      button.textContent=`← ${homeLabel()}`;
      view.prepend(button);
    }
  }

  const view=document.getElementById('view');
  if(view){
    new MutationObserver(applySectionNavigation).observe(view,{childList:true,subtree:false});
    applySectionNavigation();
  }
})();