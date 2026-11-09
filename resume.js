(() => {
  'use strict';
  const params = new URLSearchParams(window.location.search);
  let language = params.get('lang') === 'en' ? 'en' : 'pt';
  if (!params.has('lang')) {
    try { if (localStorage.getItem('mak-portfolio-language') === 'en') language = 'en'; } catch {}
  }
  function applyLanguage() {
    document.documentElement.lang = language === 'en' ? 'en' : 'pt-BR';
    document.getElementById('resume-pt').hidden = language === 'en';
    document.getElementById('resume-en').hidden = language === 'pt';
    document.getElementById('resume-language').textContent = language === 'pt' ? 'EN' : 'PT';
    document.getElementById('resume-language').setAttribute('aria-label', language === 'pt' ? 'Switch to English' : 'Mudar para português');
    document.getElementById('print-resume').textContent = language === 'pt' ? 'Imprimir / salvar PDF ↗' : 'Print / save PDF ↗';
    document.getElementById('back-link').textContent = language === 'pt' ? '← Portfólio' : '← Portfolio';
    document.title = (language === 'pt' ? 'Currículo' : 'Résumé') + ' · Makgregor Alves Altê';
    try { localStorage.setItem('mak-portfolio-language', language); } catch {}
  }
  document.getElementById('resume-language').addEventListener('click', () => { language = language === 'pt' ? 'en' : 'pt'; applyLanguage(); });
  document.getElementById('print-resume').addEventListener('click', () => window.print());
  applyLanguage();
})();
