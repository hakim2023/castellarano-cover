// Scroll-reveal. Content is fully visible without JS or with reduced motion.
// Plain position check (not IntersectionObserver) so it also works in tall-viewport renderers and crawlers.
if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
  let els = [...document.querySelectorAll('.reveal')];
  document.documentElement.classList.add('js');
  const check = () => {
    // At the bottom of the page everything left must show, even if it never reaches the line.
    const limit = innerHeight + scrollY >= document.documentElement.scrollHeight - 4 ? Infinity : innerHeight * 0.92;
    els = els.filter((el) => (el.getBoundingClientRect().top < limit ? (el.classList.add('in'), false) : true));
    if (!els.length) { removeEventListener('scroll', check); removeEventListener('resize', check); }
  };
  addEventListener('scroll', check, { passive: true });
  addEventListener('resize', check);
  check();
}

// "Scroll" cue: visible only while the visitor is at the very top of the page.
const cue = document.querySelector('.scrollcue');
if (cue) {
  cue.hidden = false;
  const update = () => cue.classList.toggle('gone', scrollY > 40);
  addEventListener('scroll', update, { passive: true });
  update();
}
