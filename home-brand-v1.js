(()=>{
  const baseRenderHome=renderHome;
  renderHome=function(){
    baseRenderHome();
    const hero=view.querySelector('.hero');
    if(!hero)return;
    hero.classList.add('academy-home-brand');
    const h2=hero.querySelector('h2');
    if(h2)h2.textContent='ӀАКЪИДАТАН АКАДЕМИЯ';

    const logo=document.createElement('img');
    logo.className='academy-home-logo';
    logo.src='https://t.me/i/userpic/320/AkidatanAcademyAppBot.jpg?v=2';
    logo.alt='Ӏакъидатан Академия';

    const menu=document.createElement('button');
    menu.className='academy-home-menu';
    menu.type='button';
    menu.setAttribute('aria-label','Открыть меню');
    menu.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>';
    menu.addEventListener('click',()=>document.getElementById('side-menu-toggle')?.click());

    const motto=document.createElement('p');
    motto.className='academy-home-motto';
    motto.textContent=state.language==='ce'?'Iилмано АллахIана гергавоьху':'Знание приближает к Аллаху';
    const divider=document.createElement('div');
    divider.className='academy-home-divider';
    divider.innerHTML='<span class="academy-home-ornament" aria-hidden="true"></span>';

    hero.prepend(logo);
    hero.prepend(menu);
    h2?.insertAdjacentElement('afterend',motto);
    motto.insertAdjacentElement('afterend',divider);
  };
  if(state.route==='home')render();
})();