// MOCHA Lab — shared site behavior

document.addEventListener('DOMContentLoaded', () => {
  // ---------------------------------------------------------------------
  // Mobile nav toggle (keeps aria-expanded in sync, closes on Escape)
  // ---------------------------------------------------------------------
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    const setOpen = (open) => {
      links.classList.toggle('open', open);
      toggle.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    };
    toggle.addEventListener('click', () => setOpen(!links.classList.contains('open')));
    links.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setOpen(false)));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && links.classList.contains('open')) {
        setOpen(false);
        toggle.focus();
      }
    });
  }

  // ---------------------------------------------------------------------
  // Tell screen-reader users when a link opens a new tab
  // ---------------------------------------------------------------------
  document.querySelectorAll('a[target="_blank"]:not([data-youtube-id])').forEach((a) => {
    if (a.querySelector('.sr-only')) return;
    const note = document.createElement('span');
    note.className = 'sr-only';
    note.textContent = ' (opens in a new tab)';
    a.appendChild(note);
  });

  // ---------------------------------------------------------------------
  // "How much bigger is B?" area-perception demo (home page)
  // ---------------------------------------------------------------------
  const demo = document.getElementById('demo-svg');
  if (demo) {
    const R_A = 30;          // radius of circle A (svg units)
    const UNIT = 60;         // bar length for 1x
    const circleB = document.getElementById('demo-b');
    const bars = document.getElementById('demo-bars');
    const barB = document.getElementById('demo-bar-b');
    const barLabel = document.getElementById('demo-bar-label');
    const slider = document.getElementById('demo-guess');
    const out = document.getElementById('demo-out');
    const btn = document.getElementById('demo-check');
    const result = document.getElementById('demo-result');
    const ratios = [3, 4, 5, 6, 7];
    let k = 0;
    let revealed = false;

    const fmt = (n) => (Number.isInteger(n) ? String(n) : n.toFixed(1));
    const showGuess = () => {
      const g = Number(slider.value);
      out.textContent = `${fmt(g)}× A's`;
      slider.setAttribute('aria-valuetext', `${fmt(g)} times A's area`);
    };

    const newRound = () => {
      const options = ratios.filter((r) => r !== k);
      k = options[Math.floor(Math.random() * options.length)];
      circleB.setAttribute('r', (R_A * Math.sqrt(k)).toFixed(1));
      barB.setAttribute('width', UNIT * k);
      barLabel.setAttribute('x', 60 + UNIT * k + 10);
      barLabel.textContent = `${k}×`;
      bars.classList.remove('is-shown');
      slider.value = 2;
      slider.disabled = false;
      showGuess();
      result.textContent = '';
      btn.textContent = 'Check my estimate';
      revealed = false;
    };

    slider.addEventListener('input', showGuess);

    btn.addEventListener('click', () => {
      if (revealed) { newRound(); slider.focus(); return; }
      const g = Number(slider.value);
      const diff = g - k;
      let verdict;
      if (Math.abs(diff) <= 0.5) {
        verdict = `Sharp eye. You said ${fmt(g)}×, and B is <strong>${k}×</strong> A's area.`;
      } else if (diff < 0) {
        verdict = `You said ${fmt(g)}×. B is actually <strong>${k}×</strong> A's area. That's the usual pattern: people tend to underestimate differences in area.`;
      } else {
        verdict = `You said ${fmt(g)}×. B is actually <strong>${k}×</strong> A's area, so you overshot this time.`;
      }
      result.innerHTML = `${verdict} Now compare the bars below the circles: the same ${k}× gap is far easier to judge as length. It's one reason position and length usually beat area in charts. <cite>(Cleveland &amp; McGill, 1984)</cite>`;
      bars.classList.add('is-shown');
      slider.disabled = true;
      btn.textContent = 'Try another';
      revealed = true;
    });

    newRound();
  }

  // ---------------------------------------------------------------------
  // Lightweight YouTube facade: loads the player only when asked
  // (faster page, no third-party cookies until the visitor presses play)
  // ---------------------------------------------------------------------
  document.querySelectorAll('[data-youtube-id]').forEach((facade) => {
    facade.addEventListener('click', (e) => {
      e.preventDefault();
      const id = facade.dataset.youtubeId;
      const iframe = document.createElement('iframe');
      iframe.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
      iframe.title = facade.dataset.title || 'YouTube video';
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      iframe.allowFullscreen = true;
      iframe.referrerPolicy = 'strict-origin-when-cross-origin';
      facade.replaceWith(iframe);
      iframe.focus();
    });
  });

  // ---------------------------------------------------------------------
  // Publication topic filters (progressive enhancement)
  // ---------------------------------------------------------------------
  const filterBar = document.querySelector('.pub-filters');
  if (filterBar) {
    const items = Array.from(document.querySelectorAll('.pub-item[data-topics]'));
    const groups = Array.from(document.querySelectorAll('.pub-group:not(.pub-group--static)'));
    const chips = Array.from(filterBar.querySelectorAll('.chip'));
    const status = document.getElementById('pub-status');
    const total = items.length;

    // Show a count on each chip
    chips.forEach((chip) => {
      const topic = chip.dataset.topic;
      const n = topic === 'all' ? total : items.filter((i) => i.dataset.topics.split(' ').includes(topic)).length;
      const count = document.createElement('span');
      count.className = 'chip__count';
      count.textContent = ` ${n}`;
      chip.appendChild(count);
    });

    const apply = (topic, updateUrl) => {
      let shown = 0;
      items.forEach((item) => {
        const match = topic === 'all' || item.dataset.topics.split(' ').includes(topic);
        item.hidden = !match;
        if (match) shown += 1;
      });
      groups.forEach((g) => {
        g.hidden = !g.querySelector('.pub-item:not([hidden])');
      });
      chips.forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.topic === topic)));
      if (status) {
        const label = chips.find((c) => c.dataset.topic === topic);
        status.textContent = topic === 'all'
          ? `Showing all ${total} papers`
          : `Showing ${shown} of ${total} papers in ${label ? label.dataset.label : topic}`;
      }
      if (updateUrl && window.history && history.replaceState) {
        const url = new URL(window.location.href);
        if (topic === 'all') url.searchParams.delete('topic');
        else url.searchParams.set('topic', topic);
        history.replaceState(null, '', url);
      }
    };

    chips.forEach((chip) => chip.addEventListener('click', () => apply(chip.dataset.topic, true)));

    const initial = new URLSearchParams(window.location.search).get('topic');
    apply(chips.some((c) => c.dataset.topic === initial) ? initial : 'all', false);
  }

  // ---------------------------------------------------------------------
  // Contact form (Formspree AJAX submission)
  // ---------------------------------------------------------------------
  const form = document.getElementById('mocha-contact-form');
  if (form) {
    const successBox = document.getElementById('formSuccess');
    const generalError = document.getElementById('formGeneralError');
    const submitBtn = form.querySelector('button[type="submit"]');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      generalError.classList.remove('visible');
      generalError.textContent = '';
      form.querySelectorAll('.form-error').forEach((el) => (el.textContent = ''));
      form.querySelectorAll('[aria-invalid]').forEach((el) => el.removeAttribute('aria-invalid'));
      submitBtn.disabled = true;

      try {
        const response = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { Accept: 'application/json' },
        });

        if (response.ok) {
          form.reset();
          form.hidden = true;
          successBox.classList.add('visible');
          successBox.focus();
        } else {
          const data = await response.json().catch(() => null);
          const errors = data && data.errors;
          if (errors && errors.length) {
            let shownGeneral = false;
            errors.forEach((err) => {
              const target = err.field && form.querySelector(`[data-error-for="${err.field}"]`);
              if (target) {
                target.textContent = err.message;
                const input = form.querySelector(`[name="${err.field}"]`);
                if (input) input.setAttribute('aria-invalid', 'true');
              } else if (!shownGeneral) {
                generalError.textContent = err.message;
                generalError.classList.add('visible');
                shownGeneral = true;
              }
            });
          } else {
            generalError.textContent = 'Something went wrong. Please try again or email me directly.';
            generalError.classList.add('visible');
          }
        }
      } catch (err) {
        generalError.textContent = 'Network error — please try again or email me directly.';
        generalError.classList.add('visible');
      } finally {
        submitBtn.disabled = false;
      }
    });
  }
});
