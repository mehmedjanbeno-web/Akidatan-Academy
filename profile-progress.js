(()=>{
  const view=document.getElementById('view');
  if(!view)return;

  const style=document.createElement('style');
  style.textContent=`
    .profile-progress-card{margin:16px 0 22px;padding:20px;border:1px solid var(--line);border-radius:24px;background:var(--surface);box-shadow:0 10px 28px rgba(0,0,0,.08)}
    .profile-progress-top{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:14px}
    .profile-progress-title{font-size:calc(21px * var(--font-scale));font-weight:900;line-height:1.15}
    .profile-progress-course{margin-top:5px;color:var(--muted);font-size:calc(15px * var(--font-scale));font-weight:700}
    .profile-progress-percent{font-size:calc(28px * var(--font-scale));font-weight:900;color:var(--gold);white-space:nowrap}
    .profile-progress-track{height:12px;border-radius:999px;background:rgba(127,127,127,.18);overflow:hidden}
    .profile-progress-fill{height:100%;border-radius:inherit;background:var(--gold);transition:width .25s ease}
    .profile-progress-bottom{display:flex;justify-content:space-between;gap:12px;margin-top:10px;color:var(--muted);font-size:calc(14px * var(--font-scale));font-weight:700}
  `;
  document.head.appendChild(style);

  function getDone(){
    try{
      const list=JSON.parse(localStorage.getItem('academy-completed')||'[]');
      return new Set(Array.isArray(list)?list:[]);
    }catch(_){return new Set()}
  }

  function labels(){
    const ce=document.documentElement.lang==='ce';
    return ce
      ? {title:'Юкъара кхиам',course:'Курс 1',lessons:'Чекхдаьхна урокаш'}
      : {title:'Общий прогресс',course:'Курс 1',lessons:'Пройдено уроков'};
  }

  function isProfile(){
    return document.querySelector('.nav-item[data-route="profile"]')?.classList.contains('active');
  }

  function apply(){
    if(!isProfile())return;
    const old=view.querySelector('.profile-progress-card');
    const doneSet=getDone();
    let done=0;
    for(let i=1;i<=20;i++) if(doneSet.has(`lesson-${i}`)) done++;
    const percent=Math.round(done/20*100);
    const text=labels();
    const html=`<section class="profile-progress-card">
      <div class="profile-progress-top">
        <div><div class="profile-progress-title">${text.title}</div><div class="profile-progress-course">${text.course}</div></div>
        <div class="profile-progress-percent">${percent}%</div>
      </div>
      <div class="profile-progress-track"><div class="profile-progress-fill" style="width:${percent}%"></div></div>
      <div class="profile-progress-bottom"><span>${text.lessons}</span><strong>${done}/20</strong></div>
    </section>`;
    if(old){old.outerHTML=html;return}
    const cards=[...view.querySelectorAll(':scope > .card')];
    const firstCard=cards[0];
    if(firstCard) firstCard.insertAdjacentHTML('afterend',html);
  }

  let scheduled=false;
  function schedule(){
    if(scheduled)return;
    scheduled=true;
    requestAnimationFrame(()=>{scheduled=false;apply()});
  }

  new MutationObserver(schedule).observe(view,{childList:true,subtree:false});
  document.addEventListener('click',()=>setTimeout(schedule,0));
  window.addEventListener('storage',schedule);
  schedule();
})();