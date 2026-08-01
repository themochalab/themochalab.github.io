// MOCHA Lab — shared site behavior

document.addEventListener('DOMContentLoaded', () => {
  // Mobile nav toggle
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      links.classList.toggle('open');
      toggle.classList.toggle('open');
    });
    links.querySelectorAll('a').forEach((a) =>
      a.addEventListener('click', () => links.classList.remove('open'))
    );
  }

  // Scroll-reveal animations
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('in-view'));
  }

  // Contact form (Formspree AJAX submission)
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
        } else {
          const data = await response.json().catch(() => null);
          const errors = data && data.errors;
          if (errors && errors.length) {
            let shownGeneral = false;
            errors.forEach((err) => {
              const target = err.field && form.querySelector(`[data-error-for="${err.field}"]`);
              if (target) {
                target.textContent = err.message;
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
