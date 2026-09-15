(()=>{
  const BOT='https://t.me/AkidatanAcademyAppBot';
  let busy=false;
  function language(){return (window.state?.language||localStorage.getItem('academy-language')||document.documentElement.lang||'ru')==='ce'?'ce':'ru'}
  function openBot(){
    if(busy)return;
    busy=true;
    const url=`${BOT}?start=question_${language()}`;
    const tg=window.Telegram?.WebApp;
    try{if(tg?.openTelegramLink){tg.openTelegramLink(url);return}}catch(_){}
    try{window.location.assign(url);return}catch(_){}
  }
  function hit(e){
    const target=e.target?.closest?.('.side-menu-faq-bot');
    if(!target)return;
    e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
    document.querySelector('.side-menu-backdrop')?.classList.remove('open');
    document.body.classList.remove('side-menu-open');
    document.getElementById('side-menu-toggle')?.setAttribute('aria-expanded','false');
    openBot();
  }
  document.addEventListener('pointerdown',hit,true);
  document.addEventListener('touchstart',hit,true);
  document.addEventListener('click',hit,true);
})();