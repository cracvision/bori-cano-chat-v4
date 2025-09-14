// Reproduce las animaciones del splash y hace prefetch + redirect (3.8s)
(function () {
  function initAnimations() {
    if (typeof window.anime === 'undefined') return;
    var anime = window.anime;

    // Headline "Wepa Panita!" — envolver letras
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

    // Título por palabra
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

  function prefetchChat() {
    try {
      var l = document.createElement('link');
      l.rel = 'prefetch';
      l.as = 'document';
      l.href = 'chat.html';
      document.head.appendChild(l);

      var warm = function () {
        try { fetch('chat.html', { cache: 'force-cache', credentials: 'same-origin' }).catch(function () {}); }
        catch (e) {}
      };
      if ('requestIdleCallback' in window) {
        requestIdleCallback(function(){ warm(); }, { timeout: 1200 });
      } else {
        setTimeout(warm, 1200);
      }
    } catch (e) {}
  }

  function scheduleRedirect(ms) {
    setTimeout(function () {
      window.location.replace('chat.html');
    }, ms);
  }

  function start() {
    initAnimations();
    prefetchChat();
    scheduleRedirect(3800); // 3–5s window
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
