const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
}

const state = {
  route: 'home',
  selectedCourse: 'course-1',
  selectedLesson: 'lesson-1',
  theme: localStorage.getItem('academy-theme') || 'light',
  favorites: JSON.parse(localStorage.getItem('academy-favorites') || '[]'),
  completed: JSON.parse(localStorage.getItem('academy-completed') || '[]'),
  search: ''
};

const courses = [
  {
    id: 'course-1',
    title: 'Тестовый курс',
    subtitle: 'Временный раздел для проверки Mini App',
    lessons: ['lesson-1', 'lesson-2', 'lesson-3']
  },
  {
    id: 'course-2',
    title: 'Второй тестовый курс',
    subtitle: 'Будущий материал будет добавлен позже',
    lessons: ['lesson-4', 'lesson-5']
  }
];

const lessons = [
  { id:'lesson-1', courseId:'course-1', number:1, title:'Тестовый урок 1', text:'Это временный текст для проверки экрана урока. Настоящие материалы из канала здесь пока не используются.', duration:'12:40', pdf:true },
  { id:'lesson-2', courseId:'course-1', number:2, title:'Тестовый урок 2', text:'Здесь будет начальный текст урока, аудиозапись и PDF-файл.', duration:'18:15', pdf:true },
  { id:'lesson-3', courseId:'course-1', number:3, title:'Тестовый урок 3', text:'Этот урок нужен только для проверки навигации, избранного и прогресса.', duration:'09:55', pdf:false },
  { id:'lesson-4', courseId:'course-2', number:1, title:'Тестовый урок 4', text:'Позже сюда можно загрузить реальные материалы курса без изменения интерфейса.', duration:'15:08', pdf:true },
  { id:'lesson-5', courseId:'course-2', number:2, title:'Тестовый урок 5', text:'Видеоуроки в текущей версии не используются.', duration:'21:30', pdf:false }
];

const view = document.getElementById('view');
const title = document.getElementById('page-title');
const themeToggle = document.getElementById('theme-toggle');

document.documentElement.dataset.theme = state.theme;

function save() {
  localStorage.setItem('academy-theme', state.theme);
  localStorage.setItem('academy-favorites', JSON.stringify(state.favorites));
  localStorage.setItem('academy-completed', JSON.stringify(state.completed));
}

function toast(message) {
  let el = document.querySelector('.toast');
  if (!el) {
    el = document.createElement('div');
    el.className = 'toast';
    document.body.appendChild(el);
  }
  el.textContent = message;
  requestAnimationFrame(() => el.classList.add('show'));
  setTimeout(() => el.classList.remove('show'), 1600);
}

function haptic() {
  try { tg?.HapticFeedback?.impactOccurred('light'); } catch (_) {}
}

function navigate(route, options={}) {
  state.route = route;
  Object.assign(state, options);
  render();
  window.scrollTo({top:0, behavior:'smooth'});
  haptic();
}

function setActiveNav(route) {
  const base = ['course','lesson','search','progress'].includes(route) ? 'courses' : route;
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.route === base || (route === 'home' && btn.dataset.route === 'home'));
  });
}

function progressValue() {
  return lessons.length ? Math.round((state.completed.length / lessons.length) * 100) : 0;
}

function renderHome() {
  title.textContent = 'Главная';
  const percent = progressValue();
  view.innerHTML = `
    <section class="hero">
      <div class="hero-kicker">Учебное пространство</div>
      <h2>Ӏакъидатан Академия</h2>
      <p>Первая рабочая версия Mini App. Реальные материалы курса будут добавлены после проверки интерфейса.</p>
      <button class="primary-btn" data-action="continue">Продолжить обучение</button>
    </section>

    <div class="section-head"><h2>Быстрый доступ</h2></div>
    <section class="grid-2">
      <button class="card quick-card" data-route-btn="courses"><span class="quick-icon">▤</span><span><div class="quick-title">Курсы</div><div class="quick-sub">Все учебные разделы</div></span></button>
      <button class="card quick-card" data-route-btn="search"><span class="quick-icon">⌕</span><span><div class="quick-title">Поиск</div><div class="quick-sub">Найти нужный урок</div></span></button>
      <button class="card quick-card" data-route-btn="favorites"><span class="quick-icon">♡</span><span><div class="quick-title">Избранное</div><div class="quick-sub">Сохранённые уроки</div></span></button>
      <button class="card quick-card" data-route-btn="progress"><span class="quick-icon">◎</span><span><div class="quick-title">Прогресс</div><div class="quick-sub">Отслеживание прохождения</div></span></button>
    </section>

    <div class="section-head"><h2>Мой прогресс</h2><button class="link-btn" data-route-btn="progress">Подробнее</button></div>
    <section class="card progress-card">
      <div class="progress-row"><span>Пройдено уроков</span><strong>${state.completed.length}/${lessons.length}</strong></div>
      <div class="progress-track"><div class="progress-fill" style="width:${percent}%"></div></div>
      <div class="quick-sub">${percent}% завершено</div>
    </section>
  `;
}

function renderCourses() {
  title.textContent = 'Курсы';
  view.innerHTML = `
    <div class="search-wrap"><input id="course-search" placeholder="Поиск по курсам и урокам" value="${escapeHtml(state.search)}"><span>⌕</span></div>
    <section class="course-list">
      ${courses.map((course, i) => `
        <button class="course-card" data-course="${course.id}">
          <div class="course-top"><span class="badge">Курс ${i+1}</span><span>›</span></div>
          <h3>${course.title}</h3>
          <p>${course.subtitle}</p>
          <div class="quick-sub" style="margin-top:12px">${course.lessons.length} уроков</div>
        </button>
      `).join('')}
    </section>
  `;
}

function renderCourse() {
  const course = courses.find(c => c.id === state.selectedCourse) || courses[0];
  title.textContent = course.title;
  const courseLessons = lessons.filter(l => l.courseId === course.id);
  view.innerHTML = `
    <button class="link-btn" data-back="courses">← Все курсы</button>
    <section class="card">
      <span class="badge">Учебный раздел</span>
      <h2 style="margin:10px 0 6px">${course.title}</h2>
      <p style="margin:0;color:var(--muted)">${course.subtitle}</p>
    </section>
    <div class="section-head"><h2>Уроки</h2><span class="quick-sub">${courseLessons.length}</span></div>
    <section class="lesson-list">
      ${courseLessons.map(lessonCard).join('')}
    </section>
  `;
}

function lessonCard(lesson) {
  const fav = state.favorites.includes(lesson.id);
  const done = state.completed.includes(lesson.id);
  return `
    <div class="lesson-card ${done ? 'completed' : ''}">
      <div class="lesson-top">
        <button class="link-btn" style="text-align:left;padding:0;flex:1;color:var(--text)" data-lesson="${lesson.id}">
          <span class="badge">Урок ${lesson.number}</span>
          <h3>${lesson.title}</h3>
          <p>Аудио · ${lesson.duration}${lesson.pdf ? ' · PDF' : ''}</p>
        </button>
        <button class="favorite-btn" data-favorite="${lesson.id}" aria-label="Избранное">${fav ? '♥' : '♡'}</button>
      </div>
    </div>
  `;
}

function renderLesson() {
  const lesson = lessons.find(l => l.id === state.selectedLesson) || lessons[0];
  const course = courses.find(c => c.id === lesson.courseId);
  const courseLessons = lessons.filter(l => l.courseId === lesson.courseId);
  const idx = courseLessons.findIndex(l => l.id === lesson.id);
  const fav = state.favorites.includes(lesson.id);
  const done = state.completed.includes(lesson.id);
  title.textContent = `Урок ${lesson.number}`;
  view.innerHTML = `
    <button class="link-btn" data-back="course">← ${course.title}</button>
    <section class="lesson-screen">
      <div class="lesson-header">
        <div class="hero-kicker">Урок ${lesson.number}</div>
        <h2>${lesson.title}</h2>
        <p>${course.title}</p>
      </div>

      <section class="card">
        <div class="audio-box">
          <button class="play-btn" data-play>▶</button>
          <div class="audio-meta"><div class="audio-title">Аудио урока</div><div class="audio-sub">00:00 / ${lesson.duration}</div><div class="fake-wave"></div></div>
          <button class="speed-btn" data-speed>1×</button>
        </div>
      </section>

      <section class="card">
        <div class="section-head"><h2>Начальный текст</h2></div>
        <p class="lesson-text">${lesson.text}</p>
      </section>

      <section class="card">
        <div class="section-head"><h2>Материалы</h2></div>
        ${lesson.pdf ? `<div class="file-row"><div class="file-meta"><span class="file-icon">▧</span><div><strong>PDF к уроку</strong><div class="quick-sub">Файл будет добавлен позже</div></div></div><button class="secondary-btn" data-pdf>Открыть</button></div>` : `<div class="quick-sub">Для этого тестового урока PDF не предусмотрен.</div>`}
      </section>

      <div class="row-actions">
        <button class="secondary-btn" data-favorite="${lesson.id}">${fav ? '♥ В избранном' : '♡ В избранное'}</button>
        <button class="primary-btn" data-complete="${lesson.id}">${done ? '✓ Урок пройден' : 'Отметить пройденным'}</button>
      </div>

      <div class="row-actions">
        <button class="secondary-btn" data-prev ${idx <= 0 ? 'disabled style="opacity:.45"' : ''}>← Предыдущий</button>
        <button class="secondary-btn" data-next ${idx >= courseLessons.length-1 ? 'disabled style="opacity:.45"' : ''}>Следующий →</button>
      </div>
    </section>
  `;
}

function renderSearch() {
  title.textContent = 'Поиск';
  const q = state.search.trim().toLowerCase();
  const found = q ? lessons.filter(l => `${l.title} ${l.text}`.toLowerCase().includes(q)) : lessons;
  view.innerHTML = `
    <div class="search-wrap"><input id="lesson-search" autofocus placeholder="Введите название урока" value="${escapeHtml(state.search)}"><span>⌕</span></div>
    <section class="lesson-list">${found.length ? found.map(lessonCard).join('') : emptyHtml('Ничего не найдено','Попробуйте другой запрос.')}</section>
  `;
}

function renderFavorites() {
  title.textContent = 'Избранное';
  const favs = lessons.filter(l => state.favorites.includes(l.id));
  view.innerHTML = favs.length ? `<section class="lesson-list">${favs.map(lessonCard).join('')}</section>` : emptyHtml('Пока пусто','Добавляйте уроки в избранное, чтобы быстро возвращаться к ним.');
}

function renderProgress() {
  title.textContent = 'Мой прогресс';
  const percent = progressValue();
  view.innerHTML = `
    <section class="card progress-card">
      <div class="progress-row"><span>Общий прогресс</span><strong>${percent}%</strong></div>
      <div class="progress-track"><div class="progress-fill" style="width:${percent}%"></div></div>
      <div class="quick-sub">Пройдено ${state.completed.length} из ${lessons.length} тестовых уроков</div>
    </section>
    <div class="section-head"><h2>Пройденные уроки</h2></div>
    <section class="lesson-list">
      ${state.completed.length ? lessons.filter(l=>state.completed.includes(l.id)).map(lessonCard).join('') : emptyHtml('Нет пройденных уроков','Отметьте урок как пройденный, и он появится здесь.')}
    </section>
  `;
}

function renderProfile() {
  title.textContent = 'Профиль';
  const user = tg?.initDataUnsafe?.user;
  const display = user ? [user.first_name, user.last_name].filter(Boolean).join(' ') : 'Ученик Академии';
  const initials = display.split(' ').map(x=>x[0]).join('').slice(0,2).toUpperCase();
  view.innerHTML = `
    <section class="card profile-card">
      <div class="avatar">${escapeHtml(initials || 'А')}</div>
      <div><h2>${escapeHtml(display)}</h2><p>${user?.username ? '@'+escapeHtml(user.username) : 'Telegram Mini App'}</p></div>
    </section>
    <section class="card settings-list">
      <div class="setting-row"><div><strong>Тёмная тема</strong><div class="quick-sub">Изменить оформление приложения</div></div><button id="profile-theme" class="toggle ${state.theme==='dark'?'on':''}" aria-label="Тёмная тема"></button></div>
      <div class="setting-row"><div><strong>Язык интерфейса</strong><div class="quick-sub">Сейчас: Русский · Чеченский добавим позже</div></div><span>›</span></div>
      <div class="setting-row"><div><strong>Прогресс</strong><div class="quick-sub">${state.completed.length} из ${lessons.length} уроков</div></div><button class="link-btn" data-route-btn="progress">Открыть</button></div>
    </section>
    <section class="card"><strong>О версии</strong><p class="quick-sub" style="margin-bottom:0">Прототип 0.1 · Без настоящих материалов курса</p></section>
  `;
}

function emptyHtml(head, text) {
  return `<section class="card empty-state"><div class="empty-icon">✦</div><h2>${head}</h2><p>${text}</p></section>`;
}

function escapeHtml(value='') {
  return String(value).replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
}

function render() {
  setActiveNav(state.route);
  const routes = {
    home: renderHome,
    courses: renderCourses,
    course: renderCourse,
    lesson: renderLesson,
    search: renderSearch,
    favorites: renderFavorites,
    progress: renderProgress,
    profile: renderProfile
  };
  (routes[state.route] || renderHome)();
  bindDynamicEvents();
}

function bindDynamicEvents() {
  document.querySelectorAll('[data-route-btn]').forEach(el => el.addEventListener('click', () => navigate(el.dataset.routeBtn)));
  document.querySelectorAll('[data-course]').forEach(el => el.addEventListener('click', () => navigate('course', {selectedCourse:el.dataset.course})));
  document.querySelectorAll('[data-lesson]').forEach(el => el.addEventListener('click', () => navigate('lesson', {selectedLesson:el.dataset.lesson})));
  document.querySelectorAll('[data-back]').forEach(el => el.addEventListener('click', () => navigate(el.dataset.back)));
  document.querySelectorAll('[data-favorite]').forEach(el => el.addEventListener('click', e => { e.stopPropagation(); toggleFavorite(el.dataset.favorite); }));
  document.querySelectorAll('[data-complete]').forEach(el => el.addEventListener('click', () => toggleComplete(el.dataset.complete)));

  const courseSearch = document.getElementById('course-search');
  if (courseSearch) courseSearch.addEventListener('input', e => { state.search = e.target.value; if (state.search.trim()) navigate('search'); });
  const lessonSearch = document.getElementById('lesson-search');
  if (lessonSearch) lessonSearch.addEventListener('input', e => { state.search = e.target.value; renderSearch(); bindDynamicEvents(); });

  const continueBtn = document.querySelector('[data-action="continue"]');
  if (continueBtn) continueBtn.addEventListener('click', () => {
    const next = lessons.find(l => !state.completed.includes(l.id)) || lessons[0];
    navigate('lesson',{selectedLesson:next.id});
  });

  const playBtn = document.querySelector('[data-play]');
  if (playBtn) playBtn.addEventListener('click', () => { playBtn.textContent = playBtn.textContent === '▶' ? '❚❚' : '▶'; toast('Тестовый плеер: реальное аудио добавим позже'); });

  const speedBtn = document.querySelector('[data-speed]');
  if (speedBtn) speedBtn.addEventListener('click', () => {
    const values=['1×','1.25×','1.5×','2×'];
    speedBtn.textContent = values[(values.indexOf(speedBtn.textContent)+1)%values.length];
  });

  const pdfBtn = document.querySelector('[data-pdf]');
  if (pdfBtn) pdfBtn.addEventListener('click', () => toast('PDF будет подключён позже'));

  const profileTheme = document.getElementById('profile-theme');
  if (profileTheme) profileTheme.addEventListener('click', toggleTheme);

  const current = lessons.find(l => l.id === state.selectedLesson);
  if (current) {
    const list = lessons.filter(l=>l.courseId===current.courseId);
    const idx = list.findIndex(l=>l.id===current.id);
    const prev = document.querySelector('[data-prev]');
    const next = document.querySelector('[data-next]');
    if (prev && idx>0) prev.addEventListener('click',()=>navigate('lesson',{selectedLesson:list[idx-1].id}));
    if (next && idx<list.length-1) next.addEventListener('click',()=>navigate('lesson',{selectedLesson:list[idx+1].id}));
  }
}

function toggleFavorite(id) {
  state.favorites = state.favorites.includes(id) ? state.favorites.filter(x=>x!==id) : [...state.favorites,id];
  save();
  render();
  toast(state.favorites.includes(id) ? 'Добавлено в избранное' : 'Удалено из избранного');
  haptic();
}

function toggleComplete(id) {
  state.completed = state.completed.includes(id) ? state.completed.filter(x=>x!==id) : [...state.completed,id];
  save();
  render();
  toast(state.completed.includes(id) ? 'Урок отмечен как пройденный' : 'Отметка снята');
  haptic();
}

function toggleTheme() {
  state.theme = state.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = state.theme;
  save();
  render();
}

themeToggle.addEventListener('click', toggleTheme);
document.querySelectorAll('.nav-item').forEach(btn => btn.addEventListener('click', () => navigate(btn.dataset.route)));

render();
