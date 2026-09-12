(()=>{
  const baseRenderHome=renderHome;
  renderHome=function(){
    baseRenderHome();
    const hero=view.querySelector('.hero');
    if(!hero)return;
    hero.classList.add('academy-home-brand');
    const h2=hero.querySelector('h2');
    if(h2)h2.textContent='ӀАКЪИДАТАН АКАДЕМИЯ';
    const motto=document.createElement('p');
    motto.className='academy-home-motto';
    motto.textContent=state.language==='ce'?'Iилмано АллахIана гергавоьху':'Знание приближает к Аллаху';
    const divider=document.createElement('div');
    divider.className='academy-home-divider';
    divider.innerHTML='<span class="academy-home-ornament" aria-hidden="true"></span>';
    h2?.insertAdjacentElement('afterend',motto);
    motto.insertAdjacentElement('afterend',divider);
  };
  if(state.route==='home')render();
})();