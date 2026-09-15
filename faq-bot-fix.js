(()=>{
  const BOT_URL='https://t.me/AkidatanAcademyAppBot?start=question';
  let handled=false;

  function openBot(){
    if(handled)return;
    handled=true;
    const tg=window.Telegram?.WebApp;
    try{
      if(tg?.openTelegramLink){
        tg.openTelegramLink(BOT_URL);
        return;
      }
    }catch(_){}
    try{ window.location.assign(BOT_URL); }catch(_){}
  }

  document.addEventListener('click',(e)=>{
    const target=e.target?.closest?.('.side-menu-faq-bot,[data-side-action="bot"]');
    if(!target)return;

    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    document.querySelector('.side-menu-backdrop')?.classList.remove('open');
    document.body.classList.remove('side-menu-open');
    document.getElementById('side-menu-toggle')?.setAttribute('aria-expanded','false');

    openBot();
  },true);
})();
