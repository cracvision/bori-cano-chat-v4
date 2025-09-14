(function(){
  // === Splash -> Chat warmup & redirect ===
  var REDIRECT_DELAY_MS = 3800; // 3–5s window; tweak as needed
  function prefetchChat(){
    try {
      // Hint the browser to fetch chat.html soon
      var l = document.createElement('link');
      l.rel = 'prefetch'; l.as = 'document'; l.href = 'chat.html';
      document.head.appendChild(l);
      // Also warm the HTTP cache explicitly
      var warm = function(){
        try { fetch('chat.html', { cache: 'force-cache', credentials: 'same-origin' }).catch(function(){}); } catch(e){}
      };
      if ('requestIdleCallback' in window) {
        requestIdleCallback(function(){ warm(); }, { timeout: 1200 });
      } else {
        setTimeout(function(){ warm(); }, 1200);
      }
    } catch (e) {}
  }
  function scheduleRedirect(){ setTimeout(function(){ window.location.replace('chat.html'); }, REDIRECT_DELAY_MS); }
  function ensureAnime(cb){
    // If anime is already there, go.
    if (window.anime && typeof window.anime.timeline === 'function') return cb(window.anime);
    // Fallback: try jsDelivr once
    var s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/animejs@2.0.2/anime.min.js';
    s.defer = true;
    s.onload = function(){ cb(window.anime); };
    s.onerror = function(){ console.error('[Landing] Failed to load anime.js from fallback CDN'); cb(undefined); };
    document.head.appendChild(s);
  }

  function runTests(A){
    if (!/debug=1/.test(window.location.search)) return;
    var results = {
      anime_available: !!A,
      anime_timeline: !!(A && typeof A.timeline === 'function'),
      headline_exists: !!document.querySelector('.ml2'),
      title_words_count: document.querySelectorAll('.app-title .word').length
    };
    console.table(results);
  }

  function init(A){
    if (!A || typeof A.timeline !== 'function'){
      console.error('[Landing] anime.js not available. Animations skipped.');
      runTests(A);
      return;
    }

    // Wrap every letter in a span for the headline animation
    var textWrapper = document.querySelector('.ml2');
    if (textWrapper) {
      var raw = textWrapper.textContent || '';
      var wrapped = Array.prototype.map.call(raw, function(ch){
        return ch === ' ' ? ' ' : '<span class="letter">' + ch + '</span>';
      }).join('');
      textWrapper.innerHTML = wrapped;

      A.timeline({ loop: true })
        .add({
          targets: '.ml2 .letter',
          scale: [4, 1],
          opacity: [0, 1],
          translateZ: 0,
          easing: 'easeOutExpo',
          duration: 950,
          delay: function (el, i) { return 70 * i; }
        })
        .add({
          targets: '.ml2',
          opacity: 0,
          duration: 1000,
          easing: 'easeOutExpo',
          delay: 1000
        });
    }

    // Animation for the title words
    A.timeline({ loop: true })
      .add({
        targets: '.app-title .word',
        scale: [14, 1],
        opacity: [0, 1],
        easing: 'easeOutCirc',
        duration: 800,
        delay: function (el, i) { return 800 * i; }
      })
      .add({
        targets: '.app-title .word',
        opacity: 0,
        duration: 1000,
        easing: 'easeOutExpo',
        delay: 1000
      });

    runTests(A);
  }

  // Start when DOM is ready; our anime script is deferred so ordering is preserved.
  document.addEventListener('DOMContentLoaded', function(){ ensureAnime(init); prefetchChat(); scheduleRedirect(); });
})();