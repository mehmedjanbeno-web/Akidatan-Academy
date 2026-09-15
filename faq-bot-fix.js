(()=>{
  const BOT='https://t.me/AkidatanAcademyAppBot';

  function language(){
    return (window.state?.language||localStorage.getItem('academy-language')||document.documentElement.lang||'ru')==='ce'?'ce':'ru';
  }

  function openBot(){
    const url=`${BOT}?start=question_${language()}`;
    const tg=window.Telegram?.WebApp;
    try{
      if(tg?.openTelegramLink){
        tg.openTelegramLink(url);
        return;
      }
    }catch(_){}
    try{window.open(url,'_blank');return}catch(_){}
    try{window.location.href=url}catch(_){}
  }

  document.addEventListener('click',(e)=>{
    const target=e.target?.closest?.('.side-menu-faq-bot');
    if(!target)return;
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    document.querySelector('.side-menu-backdrop')?.classList.remove('open');
    document.body.classList.remove('side-menu-open');
    document.getElementById('side-menu-toggle')?.setAttribute('aria-expanded','false');
    setTimeout(openBot,50);
  },true);
})();