// anime.js se carga por CDN con "defer" antes que este archivo.
// Este JS reproduce exactamente las animaciones de tu TSX (sin TypeScript).

(function () {
  function init() {
    if (typeof window.anime === 'undefined') {
      console.error('[Landing] anime.js no se cargó. Revisa la red o el CDN.');
      return;
    }
    var anime = window.anime;

    // 1) Headline "Wepa Panita!" — envolver cada letra en <span class="letter">
    var textWrapper = document.querySelector('.ml2');
    if (textWrapper && textWrapper.textContent) {
      textWrapper.innerHTML = textWrapper.textContent.replace(/\S/g, "<span class='letter'>$&</span>");

      anime.timeline({ loop: true })
        .add({
          targets: '.ml2 .letter',
          scale: [4, 1],
          opacity: [0, 1],
          translateZ: 0,
          easing: 'easeOutExpo',
          duration: 950,
          delay: function (_el, i) { return 70 * i; }
        })
        .add({
          targets: '.ml2',
          opacity: 0,
          duration: 1000,
          easing: 'easeOutExpo',
          delay: 1000
        });
    }

    // 2) Título principal por palabra
    anime.timeline({ loop: true })
      .add({
        targets: '.app-title .word',
        scale: [14, 1],
        opacity: [0, 1],
        easing: 'easeOutCirc',
        duration: 800,
        delay: function (_el, i) { return 800 * i; }
      })
      .add({
        targets: '.app-title .word',
        opacity: 0,
        duration: 1000,
        easing: 'easeOutExpo',
        delay: 1000
      });
  }

  // Con "defer", DOM ya está listo cuando se ejecuta, pero aseguramos por si acaso:
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
