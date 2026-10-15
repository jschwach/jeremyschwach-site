(() => {
  const career = document.querySelector('.career');
  if (career && typeof requestAnimationFrame !== 'undefined') {
    const summary = career.querySelector('summary');
    const timeline = career.querySelector('.timeline');
    const chapters = [...timeline.querySelectorAll('article')];
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
    let manual = false;
    let queued = false;
    career.open = false;
    const reveal = () => {
      queued = false;
      if (manual) return;
      const top = summary.getBoundingClientRect().top;
      const progress = Math.max(0, Math.min(1, (innerHeight * .9 - top) / (innerHeight * .65)));
      const amount = reducedMotion.matches ? Number(progress > 0) : progress;
      career.open = amount > 0;
      if (amount > 0) {
        // Summary position is stable: only the content beneath it changes height.
        timeline.style.height = 'auto';
        const height = timeline.offsetHeight;
        timeline.style.height = amount < 1 ? `${height * amount}px` : 'auto';
        timeline.style.setProperty('--track-progress', String(amount));
        chapters.forEach((chapter, index) => {
          const step = reducedMotion.matches ? 1 : Math.max(0, Math.min(1, (amount - index * .12) / .76));
          chapter.style.setProperty('--chapter-reveal', String(step));
        });
      }
    };
    const queue = () => {
      if (!queued && !manual) { queued = true; requestAnimationFrame(reveal); }
    };
    const useManualControl = () => {
      manual = true;
      timeline.style.height = '';
      timeline.style.removeProperty('--track-progress');
      chapters.forEach(chapter => chapter.style.removeProperty('--chapter-reveal'));
      removeEventListener('scroll', queue);
      removeEventListener('resize', queue);
      reducedMotion.removeEventListener('change', queue);
    };
    summary.addEventListener('click', useManualControl, { once: true });
    addEventListener('scroll', queue, { passive: true });
    addEventListener('resize', queue);
    reducedMotion.addEventListener('change', queue);
    const settleContact = () => {
      const target = document.querySelector('#contact');
      if (!target) return;
      useManualControl();
      career.open = true;
      return target;
    };
    if (typeof location !== 'undefined') {
      // Hash navigation must not race a disclosure changing the layout above its target.
      // Settle once for navigation; ordinary scrolling never triggers a forced scroll.
      document.addEventListener('click', event => {
        const link = event.target.closest('a[href]');
        if (link && link.origin === location.origin && link.hash === '#contact') settleContact();
      });
      const honorContactHash = () => {
        if (location.hash !== '#contact') return;
        const target = settleContact();
        if (target) requestAnimationFrame(() => target.scrollIntoView({ behavior: 'instant', block: 'start' }));
      };
      addEventListener('hashchange', honorContactHash);
      honorContactHash();
    }
    queue();
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
  if (form) form.addEventListener('submit', event => {
    const status = document.querySelector('#form-status');
    const token = new FormData(form).get('g-recaptcha-response');
    if (!token || !String(token).trim()) {
      event.preventDefault();
      status.textContent = 'Please complete the spam check before sending. If it doesn’t appear, refresh the page or connect on LinkedIn.';
      return;
    }
    // Submit natively: Netlify validates the CAPTCHA server-side and owns the
    // result page. A rejected CAPTCHA may redirect back with HTTP 200, so AJAX
    // response.ok alone cannot establish that the message was accepted.
    status.textContent = 'Sending…';
  });
})();
