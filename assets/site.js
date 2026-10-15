(() => {
  const career = document.querySelector('.career');
  if (career && typeof IntersectionObserver !== 'undefined') {
    // Open in plain HTML; enhance to a one-time reveal without animation or focus changes.
    career.open = false;
    const summary = career.querySelector('summary');
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        career.open = true;
        observer.disconnect();
      }
    }, { rootMargin: '0px 0px -40px 0px', threshold: 0 });
    observer.observe(summary);
    // A deliberate mouse or keyboard toggle always wins over the automatic reveal.
    summary.addEventListener('click', () => observer.disconnect(), { once: true });
  }

  document.querySelectorAll('.media-art img').forEach(img => { img.addEventListener('error', () => { img.hidden = true; }); if (img.complete && !img.naturalWidth) img.hidden = true; });
  const filters = document.querySelector('.filter-bar');
  if (filters) {
    filters.hidden = false;
    const buttons = [...document.querySelectorAll('[data-filter]')];
    const cards = [...document.querySelectorAll('.media-card')];
    const input = document.querySelector('#content-search');
    let active = 'all';
    const update = () => {
      const query = input.value.trim().toLowerCase();
      let count = 0;
      cards.forEach(card => {
        const visible = (active === 'all' || card.dataset.type === active) && card.dataset.search.includes(query);
        card.hidden = !visible;
        if (visible) count++;
      });
      buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === active)));
      document.querySelector('.result-count').textContent = `${count} ${count === 1 ? 'item' : 'items'}`;
      document.querySelector('.empty-state').hidden = count !== 0;
      document.querySelector('#empty-description').textContent = active === 'speaking' && !query ? 'Speaking appearances will be added here as they’re published. Interested in an event? Get in touch below.' : 'Try another category or clear your search.';
    };
    buttons.forEach(button => button.addEventListener('click', () => {active = button.dataset.filter; update();}));
    input.addEventListener('input', update);
    document.querySelector('#reset-filters').addEventListener('click', () => {active = 'all'; input.value = ''; update(); buttons[0].focus();});
    update();
  }
  const form = document.querySelector('#contact-form');
  if (form) form.addEventListener('submit', async event => {
    event.preventDefault();
    const button = form.querySelector('button[type=submit]');
    const status = document.querySelector('#form-status');
    if (button.disabled) return;
    button.disabled = true;
    status.textContent = 'Sending…';
    try {
      const response = await fetch('/', {method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams(new FormData(form)).toString()});
      if (!response.ok) throw new Error('Submission failed');
      status.textContent = 'Thanks! Your message has been submitted.';
      form.reset();
    } catch (_) {
      status.textContent = 'Your message wasn’t sent. Please try again or connect on LinkedIn. Your message is still here.';
    } finally { button.disabled = false; }
  });
})();
