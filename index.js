// Requiere anime.js cargado (ya en <head> con defer)

(function () {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.addEventListener('DOMContentLoaded', () => {
    // 1) Animación "Wepa Panita!"
    const textWrapper = document.querySelector('.ml2');
    if (textWrapper && textWrapper.textContent) {
      // Envuelve cada letra en <span>
      textWrapper.innerHTML = textWrapper.textContent.replace(/\S/g, "<span class='letter'>$&</span>");

      if (!prefersReduced && window.anime) {
        window.anime.timeline({ loop: true })
          .add({
            targets: '.ml2 .letter',
            scale: [4, 1],
            opacity: [0, 1],
            translateZ: 0,
            easing: 'easeOutExpo',
            duration: 950,
            delay: (el, i) => 70 * i
          })
          .add({
            targets: '.ml2',
            opacity: 0,
            duration: 1000,
            easing: 'easeOutExpo',
            delay: 1000
          });
      } else {
        // Accesibilidad: sin animación
        textWrapper.style.opacity = '1';
      }
    }

    // 2) Animación del título "Borí Cano Chat"
    const titleWords = document.querySelectorAll('.app-title .word');
    if (titleWords.length && !prefersReduced && window.anime) {
      window.anime.timeline({ loop: true })
        .add({
          targets: '.app-title .word',
          scale: [14, 1],
          opacity: [0, 1],
          easing: 'easeOutCirc',
          duration: 800,
          delay: (el, i) => 800 * i
        })
        .add({
          targets: '.app-title .word',
          opacity: 0,
          duration: 1000,
          easing: 'easeOutExpo',
          delay: 1000
        });
    }
  });
})();
