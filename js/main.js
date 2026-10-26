document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initMobileMenu();
  initScrollReveal();
  initParallax();
  initCurrentYear();
  initVisitTabs();
  initContactForm();
});

function initNavbar() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  const update = () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };

  update();
  window.addEventListener('scroll', update, { passive: true });
}

function initMobileMenu() {
  const toggle = document.querySelector('.menu-toggle');
  const menu = document.querySelector('.mobile-menu');
  if (!toggle || !menu) return;

  const links = menu.querySelectorAll('a');

  const open = () => {
    toggle.classList.add('active');
    menu.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  const close = () => {
    toggle.classList.remove('active');
    menu.classList.remove('active');
    document.body.style.overflow = '';
  };

  toggle.addEventListener('click', () => {
    if (menu.classList.contains('active')) {
      close();
    } else {
      open();
    }
  });

  links.forEach(link => {
    link.addEventListener('click', close);
  });
}

function initScrollReveal() {
  const selectors = '.reveal, .reveal-scale, .reveal-left, .reveal-right';
  const reveals = document.querySelectorAll(selectors);
  if (!reveals.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -60px 0px' }
  );

  reveals.forEach((el) => observer.observe(el));
}

function initParallax() {
  const heroMedia = document.querySelector('.hero-media img');
  if (!heroMedia) return;

  let ticking = false;

  const updateParallax = () => {
    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;
    if (scrollY < windowHeight) {
      const translateY = scrollY * 0.12;
      heroMedia.style.transform = `translateY(${translateY}px) scale(1.05)`;
    }
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateParallax);
      ticking = true;
    }
  }, { passive: true });
}

function initCurrentYear() {
  const yearEl = document.querySelector('.current-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}


function initVisitTabs() {
  const tabs = document.querySelectorAll('.join-tab');
  const panels = document.querySelectorAll('.join-panel');
  if (!tabs.length || !panels.length) return;

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;

      tabs.forEach((item) => {
        const isActive = item === tab;
        item.classList.toggle('active', isActive);
        item.setAttribute('aria-selected', String(isActive));
      });

      panels.forEach((panel) => {
        const isActive = panel.dataset.panel === target;
        panel.classList.toggle('active', isActive);
        panel.hidden = !isActive;
      });
    });
  });
}

function initContactForm() {
  const form=document.getElementById('contactForm');
  if(!form) return;
  const subject=form.querySelector('[name="subject"]');
  const allowed=new Set(Array.from(subject.options).map(option=>option.value));
  const preselected=new URLSearchParams(window.location.search).get('subject');
  if(preselected && allowed.has(preselected)) subject.value=preselected;
  const feedback=document.getElementById('contactFeedback');
  const button=form.querySelector('button[type="submit"]');
  form.addEventListener('submit',async(event)=>{
    event.preventDefault();
    if(!form.reportValidity()) return;
    feedback.hidden=true;
    button.disabled=true;
    button.textContent='Envoi en cours…';
    try {
      const body=Object.fromEntries(new FormData(form).entries());
      const response=await fetch('/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
      const result=await response.json().catch(()=>({}));
      if(!response.ok) throw new Error(result.error||"Le message n'a pas pu être envoyé.");
      feedback.className='form-feedback is-success';
      feedback.textContent='Votre message a été envoyé à notre équipe. Merci !';
      feedback.hidden=false;
      form.reset();
    } catch(error) {
      feedback.className='form-feedback is-error';
      feedback.textContent=error.message||"Une erreur est survenue. Veuillez réessayer.";
      feedback.hidden=false;
    } finally {
      button.disabled=false;
      button.textContent='Envoyer';
    }
  });
}
