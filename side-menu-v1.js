(()=>{
  const svg={
    profile:'<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4.5 21a7.5 7.5 0 0 1 15 0"/></svg>',
    teacher:'<svg viewBox="0 0 24 24"><path d="m3 9 9-5 9 5-9 5z"/><path d="M6 11.2V16c2.8 2.2 9.2 2.2 12 0v-4.8M21 9v6"/></svg>',
    admin:'<svg viewBox="0 0 24 24"><path d="M4 5h16v11H9l-5 4z"/><path d="M8 10h.01M12 10h.01M16 10h.01"/></svg>',
    share:'<svg viewBox="0 0 24 24"><circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="m8.2 10.8 7.5-4.4M8.2 13.2l7.5 4.4"/></svg>',
    favorite:'<svg viewBox="0 0 24 24"><path d="M20.8 4.6a5.4 5.4 0 0 0-7.6 0L12 5.8l-1.2-1.2a5.4 5.4 0 0 0-7.6 7.6L12 21l8.8-8.8a5.4 5.4 0 0 0 0-7.6z"/></svg>',
    theme:'<svg viewBox="0 0 24 24"><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6 7 7M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4"/><circle cx="12" cy="12" r="4"/></svg>',
    language:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>',
    info:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 10v6M12 7h.01"/></svg>'
  };

  const trigger=document.getElementById('side-menu-toggle');
  if(!trigger)return;

  const backdrop=document.createElement('div');
  backdrop.className='side-menu-backdrop';
  backdrop.innerHTML=`<aside class="side-menu" role="dialog" aria-modal="true" aria-label="Меню Академии">
    <button class="side-menu-close" type="button" data-side-close aria-label="Закрыть">×</button>
    <div class="side-menu-head">
      <img class="side-menu-logo" src="https://t.me/i/userpic/320/AkidatanAcademyAppBot.jpg?v=2" alt="">
      <div class="side-menu-title">ӀАКЪИДАТАН АКАДЕМИЯ</div>
      <p class="side-menu-motto">Знание приближает к Аллаху</p>
      <div class="side-menu-divider"></div>
    </div>
    <div class="side-menu-list">
      ${item('profile',svg.profile,'Мой профиль')}
      ${item('teacher',svg.teacher,'Связь с учителем')}
      ${item('admin',svg.admin,'Связь с администратором')}
      ${item('share',svg.share,'Поделиться приложением')}
      ${item('favorites',svg.favorite,'Избранное')}
      ${item('appearance',svg.theme,'Настройки оформления')}
      ${item('language',svg.language,'Язык интерфейса')}
      ${item('about',svg.info,'О приложении')}
    </div>
    <div class="side-menu-about" data-side-about>
      <strong>Ӏакъидатан Академия</strong><br>
      Учебное пространство для последовательного прохождения аудиоуроков, сохранения заметок и отслеживания прогресса.
    </div>
    <div class="side-menu-footer">Ӏакъидатан Академия<br>Учебное пространство</div>
  </aside>`;
  document.body.appendChild(backdrop);

  function item(action,icon,label){return `<button class="side-menu-item" type="button" data-side-action="${action}"><span class="side-menu-icon">${icon}</span><span>${label}</span><span class="side-menu-arrow">›</span></button>`}
  function open(){backdrop.classList.add('open');document.body.classList.add('side-menu-open');trigger.setAttribute('aria-expanded','true');haptic?.()}
  function close(){backdrop.classList.remove('open');document.body.classList.remove('side-menu-open');trigger.setAttribute('aria-expanded','false')}
  function go(route){close();navigate(route)}
  function contactUnavailable(label){try{window.Telegram?.WebApp?.showAlert?.(`${label}: контакт будет добавлен позже.`)}catch(_){toast?.('Контакт будет добавлен позже')}}
  async function shareApp(){
    const url='https://t.me/AkidatanAcademyAppBot';
    const text='Ӏакъидатан Академия';
    close();
    try{if(navigator.share){await navigator.share({title:text,text,url});return}}catch(_){}
    try{window.Telegram?.WebApp?.openTelegramLink?.(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`)}catch(_){location.href=`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`}
  }

  trigger.addEventListener('click',open);
  backdrop.addEventListener('click',e=>{
    if(e.target===backdrop||e.target.closest('[data-side-close]')){close();return}
    const action=e.target.closest('[data-side-action]')?.dataset.sideAction;
    if(!action)return;
    if(action==='profile'){go('profile');return}
    if(action==='teacher'){contactUnavailable('Связь с учителем');return}
    if(action==='admin'){contactUnavailable('Связь с администратором');return}
    if(action==='share'){shareApp();return}
    if(action==='favorites'){go('favorites');return}
    if(action==='appearance'||action==='language'){go('profile');return}
    if(action==='about'){
      const box=backdrop.querySelector('[data-side-about]');
      box?.classList.toggle('open');
      return;
    }
  });
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&backdrop.classList.contains('open'))close()});
})();
