(() => {
  'use strict';
  const data = window.PORTFOLIO;
  const textNodes = [...document.querySelectorAll('[data-i18n]')];
  const ariaNodes = [...document.querySelectorAll('[data-i18n-aria]')];
  const originals = new Map(textNodes.map(el => [el.dataset.i18n, [...el.childNodes].map(node => node.nodeName === 'BR' ? '\n' : node.textContent).join('')]));
  const originalAria = new Map(ariaNodes.map(el => [el.dataset.i18nAria, el.getAttribute('aria-label')]));
  let language = 'pt';
  let currentFilter = 'all';
  let currentProject = null;
  let lastProjectTrigger = null;
  let copyTimer;
  const translate = key => data[language][key] || originals.get(key) || originalAria.get(key) || key;
  const menu = document.getElementById('mobile-nav');
  const menuToggle = document.getElementById('menu-toggle');
  const dialog = document.getElementById('project-dialog');
  const closeDialogButton = document.getElementById('dialog-close');
  function closeMenu() {
    menu.hidden = true;
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', translate('openMenu'));
  }
  function updateProjectCount() {
    const count = document.querySelectorAll('.project:not([hidden])').length;
    const label = translate(count === 1 ? 'projectSingular' : 'projectCount');
    document.getElementById('project-count').textContent = String(count).padStart(2, '0') + ' ' + label;
  }
  function setLanguage(next) {
    language = next;
    document.documentElement.lang = next === 'pt' ? 'pt-BR' : 'en';
    textNodes.forEach(el => {
      const key = el.dataset.i18n;
      const value = next === 'en' ? data.en[key] : originals.get(key);
      if (value === undefined) return;
      el.replaceChildren(...value.split('\n').flatMap((line, index) => index ? [document.createElement('br'), document.createTextNode(line)] : [document.createTextNode(line)]));
    });
    ariaNodes.forEach(el => {
      const key = el.dataset.i18nAria;
      el.setAttribute('aria-label', next === 'en' ? data.en[key] || originalAria.get(key) : originalAria.get(key));
    });
    document.querySelector('.lang-pt').classList.toggle('active', next === 'pt');
    document.querySelector('.lang-en').classList.toggle('active', next === 'en');
    document.getElementById('language-toggle').setAttribute('aria-label', next === 'pt' ? 'Switch to English' : 'Mudar para português');
    document.title = next === 'pt' ? 'Makgregor Alves Altê · Software & Pesquisa' : 'Makgregor Alves Altê · Software & Research';
    document.querySelector('meta[name="description"]').content = next === 'pt' ? 'Makgregor Alves Altê. Desenvolvimento de software, Python, backend e pesquisa em inteligência artificial. Conheça meus projetos e minha trajetória.' : 'Makgregor Alves Altê. Software development, Python, backend and AI research. Explore my projects and professional journey.';
    document.querySelector('meta[property="og:locale"]').content = next === 'pt' ? 'pt_BR' : 'en_US';
    document.querySelectorAll('.resume-link').forEach(link => { link.href = './curriculo.html?lang=' + next; });
    document.getElementById('copy-status').textContent = '';
    closeMenu();
    updateProjectCount();
    if (currentProject) renderProject(currentProject);
    try { localStorage.setItem('mak-portfolio-language', next); } catch {}
  }
  document.getElementById('language-toggle').addEventListener('click', () => setLanguage(language === 'pt' ? 'en' : 'pt'));
  menuToggle.addEventListener('click', () => {
    const willOpen = menu.hidden;
    menu.hidden = !willOpen;
    menuToggle.setAttribute('aria-expanded', String(willOpen));
    menuToggle.setAttribute('aria-label', translate(willOpen ? 'closeMenu' : 'openMenu'));
  });
  menu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && !menu.hidden) { closeMenu(); menuToggle.focus(); } });
  document.addEventListener('click', event => { if (!menu.hidden && !event.target.closest('.site-header')) closeMenu(); });
  window.matchMedia('(min-width: 601px)').addEventListener('change', closeMenu);
  document.querySelectorAll('[data-filter]').forEach(button => {
    button.addEventListener('click', () => {
      currentFilter = button.dataset.filter;
      document.querySelectorAll('[data-filter]').forEach(item => {
        const selected = item === button;
        item.classList.toggle('active', selected);
        item.setAttribute('aria-pressed', String(selected));
      });
      document.querySelectorAll('.project').forEach(project => { project.hidden = currentFilter !== 'all' && project.dataset.category !== currentFilter; });
      updateProjectCount();
    });
  });
  function createElement(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text) element.textContent = text;
    return element;
  }
  function renderProject(key) {
    const project = data.projects[key];
    const content = project[language];
    document.getElementById('dialog-eyebrow').textContent = content.eyebrow;
    const title = createElement('h2', 'dialog-title', content.title);
    title.id = 'dialog-title';
    const fragment = document.createDocumentFragment();
    fragment.append(title, createElement('p', 'dialog-description', content.description));
    content.sections.forEach(section => {
      const block = createElement('section', 'dialog-section');
      block.append(createElement('h3', '', section.title));
      if (section.text) block.append(createElement('p', '', section.text));
      if (section.items) {
        const list = createElement('ul');
        section.items.forEach(item => list.append(createElement('li', '', item)));
        block.append(list);
      }
      fragment.append(block);
    });
    const tech = createElement('ul', 'tech-tags');
    project.tech.forEach(item => tech.append(createElement('li', '', item)));
    fragment.append(tech);
    if (project.url) {
      const link = createElement('a', 'button button-lime dialog-cta', content.cta + ' ↗');
      link.href = project.url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      fragment.append(link);
    }
    document.getElementById('dialog-content').replaceChildren(fragment);
  }
  document.querySelectorAll('[data-project]').forEach(button => button.addEventListener('click', () => {
    currentProject = button.dataset.project;
    lastProjectTrigger = button;
    renderProject(currentProject);
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    closeDialogButton.focus();
  }));
  function closeDialog() { dialog.close(); }
  closeDialogButton.addEventListener('click', closeDialog);
  dialog.addEventListener('click', event => { if (event.target === dialog) { const r = dialog.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) closeDialog(); } });
  dialog.addEventListener('close', () => { document.body.style.overflow = ''; currentProject = null; if (lastProjectTrigger) lastProjectTrigger.focus(); });
  document.getElementById('copy-email').addEventListener('click', async () => {
    const status = document.getElementById('copy-status');
    clearTimeout(copyTimer);
    try {
      if (!navigator.clipboard) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText('makgalte@gmail.com');
      status.textContent = translate('copied');
    } catch {
      const range = document.createRange();
      range.selectNodeContents(document.querySelector('.email-link'));
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      status.textContent = translate('copyFailed');
    }
    copyTimer = setTimeout(() => { status.textContent = ''; }, 6000);
  });
  const namespace = 'http://www.w3.org/2000/svg';
  const mosaic = document.getElementById('hero-mosaic');
  const colors = ['#c8e5a2', '#6d9b7b', '#344e3e', '#adbf88'];
  let composition = 0;
  function drawMosaic() {
    const fragment = document.createDocumentFragment();
    for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) {
      const group = document.createElementNS(namespace, 'g');
      const rotation = ((x + y + composition + (composition % 2 ? x * y : 0)) % 4) * 90;
      group.setAttribute('transform', 'translate(' + x * 120 + ' ' + y * 120 + ') rotate(' + rotation + ' 60 60)');
      const bg = document.createElementNS(namespace, 'rect');
      bg.setAttribute('width', '120'); bg.setAttribute('height', '120'); bg.setAttribute('fill', '#182c23');
      group.append(bg);
      const arc = document.createElementNS(namespace, 'path');
      arc.setAttribute('d', 'M0 0H120V120A120 120 0 0 1 0 0Z');
      arc.setAttribute('fill', colors[(x + y + composition) % colors.length]);
      group.append(arc);
      const inner = document.createElementNS(namespace, 'path');
      inner.setAttribute('d', 'M0 0H60V60A60 60 0 0 1 0 0Z');
      inner.setAttribute('fill', composition % 3 === 2 ? '#16291f' : colors[(x + y + composition + 2) % colors.length]);
      group.append(inner);
      if ((x + y + composition) % 3 === 0) {
        const dot = document.createElementNS(namespace, 'circle');
        dot.setAttribute('cx', '92'); dot.setAttribute('cy', '28'); dot.setAttribute('r', '8'); dot.setAttribute('fill', '#d2e5b7');
        group.append(dot);
      }
      fragment.append(group);
    }
    mosaic.replaceChildren(fragment);
  }
  document.getElementById('remix-mosaic').addEventListener('click', () => { composition = (composition + 1) % 12; drawMosaic(); });
  document.getElementById('year').textContent = String(new Date().getFullYear());
  drawMosaic();
  try { if (localStorage.getItem('mak-portfolio-language') === 'en') setLanguage('en'); } catch {}
})();
