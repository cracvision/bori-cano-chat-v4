(function () {
  const url = new URL(location.href);
  const prefersRM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const forceAnim = url.searchParams.get('anim') === '1' || localStorage.getItem('splash_force_anim') === '1';
  const reduced   = prefersRM && !forceAnim;

  document.addEventListener('DOMContentLoaded', () => {
    const hasAnime = typeof window.anime !== 'undefined';

    // --- "Wepa Panita!" ---
    const textWrapper = document.querySelector('.ml2');
    if (textWrapper && textWrapper.textContent) {
      textWrapper.innerHTML = textWrapper.textContent.replace(/\S/g, "<span class='letter'>$&</span>");

      if (hasAnime) {
        const tl = window.anime.timeline({ loop: !reduced });
        tl.add({
          targets: '.ml2 .letter',
          scale: reduced ? [1.12, 1] : [4, 1],
          opacity: [0, 1],
          translateZ: 0,
          easing: reduced ? 'easeOutQuad' : 'easeOutExpo',
          duration: reduced ? 450 : 950,
          delay: (el, i) => (reduced ? 30 : 70) * i
        });

        if (!reduced) {
          tl.add({
            targets: '.ml2',
            opacity: 0,
            duration: 1000,
            easing: 'easeOutExpo',
            delay: 1000
          });
        }
      } else {
        textWrapper.style.opacity = '1';
      }
    }

    // --- Título "Borí Cano Chat" ---
    const titleWords = document.querySelectorAll('.app-title .word');
    if (titleWords.length && hasAnime) {
      const tl2 = window.anime.timeline({ loop: !reduced });
      tl2.add({
        targets: '.app-title .word',
        scale: reduced ? [1.1, 1] : [14, 1],
        opacity: [0, 1],
        easing: reduced ? 'easeOutQuad' : 'easeOutCirc',
        duration: reduced ? 400 : 800,
        delay: (el, i) => (reduced ? 120 : 800) * i
      });

      if (!reduced) {
        tl2.add({
          targets: '.app-title .word',
          opacity: 0,
          duration: 1000,
          easing: 'easeOutExpo',
          delay: 1000
        });
      }
    } else if (titleWords.length) {
      // Fallback sin anime.js
      document.querySelector('.app-title').style.opacity = '1';
    }
  });
})();
