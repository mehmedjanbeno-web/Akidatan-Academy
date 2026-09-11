(() => {
  const svg = (body, cls='ui-svg') => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
  const icons = {
    courses: svg('<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v16H6.5A2.5 2.5 0 0 0 4 21.5z"/><path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H13v16h4.5a2.5 2.5 0 0 1 2.5 2.5z"/>'),
    search: svg('<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/>'),
    favorites: svg('<path d="M20.8 4.6a5.4 5.4 0 0 0-7.6 0L12 5.8l-1.2-1.2a5.4 5.4 0 0 0-7.6 7.6L12 21l8.8-8.8a5.4 5.4 0 0 0 0-7.6z"/>'),
    progress: svg('<path d="M4 19V9"/><path d="M10 19V5"/><path d="M16 19v-7"/><path d="M22 19H2"/>'),
    file: svg('<path d="M6 2.8h8l4 4V21H6z"/><path d="M14 2.8V7h4"/><path d="M9 12h6M9 16h6"/>'),
    heart: svg('<path d="M20.8 4.6a5.4 5.4 0 0 0-7.6 0L12 5.8l-1.2-1.2a5.4 5.4 0 0 0-7.6 7.6L12 21l8.8-8.8a5.4 5.4 0 0 0 0-7.6z"/>'),
    heartFilled: '<svg class="ui-svg" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M12 21 3.2 12.2a5.4 5.4 0 0 1 7.6-7.6L12 5.8l1.2-1.2a5.4 5.4 0 0 1 7.6 7.6z"/></svg>',
    sparkle: svg('<path d="m12 3 1.5 4.1L18 9l-4.5 1.9L12 15l-1.5-4.1L6 9l4.5-1.9z"/><path d="m18.5 15 .7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z"/>')
  };

  let applying = false;
  function setIcon(el, key, html) {
    if (el.dataset.iconKey === key) return;
    el.innerHTML = html;
    el.dataset.iconKey = key;
  }

  function apply() {
    if (applying) return;
    applying = true;
    try {
      document.querySelectorAll('.quick-icon').forEach(el => {
        const route = el.closest('[data-route-btn]')?.dataset.routeBtn;
        if (route && icons[route]) setIcon(el, `quick-${route}`, icons[route]);
      });

      document.querySelectorAll('.search-wrap > span').forEach(el => setIcon(el, 'search', icons.search));
      document.querySelectorAll('.file-icon').forEach(el => setIcon(el, 'file', icons.file));
      document.querySelectorAll('.empty-icon').forEach(el => setIcon(el, 'sparkle', icons.sparkle));

      document.querySelectorAll('.favorite-btn').forEach(el => {
        const active = el.textContent.includes('♥') || el.dataset.favoriteActive === '1';
        const key = active ? 'heart-filled' : 'heart';
        setIcon(el, key, active ? icons.heartFilled : icons.heart);
      });
    } finally {
      applying = false;
    }
  }

  apply();
  const target = document.getElementById('view') || document.body;
  const observer = new MutationObserver(() => requestAnimationFrame(apply));
  observer.observe(target, {childList:true, subtree:true});
})();
