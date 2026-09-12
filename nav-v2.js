(()=>{
  const view=document.getElementById('view');
  if(!view)return;

  function labels(){
    const ce=document.documentElement.lang==='ce';
    return ce
      ? {back:'Йу вала',home:'Коьрте йух вал'}
      : {back:'Назад',home:'Главный экран'};
  }

  function applyNav(){
    if(view.querySelector(':scope > .hero')) return;

    const text=labels();
    const existing=view.querySelector(':scope > [data-back]');
    if(existing){
      const label=existing.dataset.back==='home'?text.home:text.back;
      const wanted=`← ${label}`;
      if(existing.textContent!==wanted) existing.textContent=wanted;
      return;
    }

    const btn=document.createElement('button');
    btn.className='link-btn section-home-btn';
    btn.dataset.back='home';
    btn.textContent=`← ${text.home}`;
    view.prepend(btn);
  }

  let scheduled=false;
  function schedule(){
    if(scheduled)return;
    scheduled=true;
    requestAnimationFrame(()=>{scheduled=false;applyNav();});
  }

  new MutationObserver(schedule).observe(view,{childList:true});
  schedule();
})();