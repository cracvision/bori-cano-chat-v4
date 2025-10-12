// Enable smooth scrolling
if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.documentElement.style.scrollBehavior = 'smooth';
}

// Scrollspy: highlight active category chip
const sections = [...document.querySelectorAll('.menu-section')];
const chips = new Map(
  [...document.querySelectorAll('.chip[data-cat]')].map(chip => [
    chip.getAttribute('href').slice(1),
    chip
  ])
);

// Intersection Observer for scrollspy
const observerOptions = {
  rootMargin: '-50% 0px -45% 0px',
  threshold: 0
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      // Remove aria-current from all chips
      chips.forEach(chip => chip.removeAttribute('aria-current'));
      
      // Set aria-current on the matching chip
      const activeChip = chips.get(entry.target.id);
      if (activeChip) {
        activeChip.setAttribute('aria-current', 'true');
        
        // Scroll chip into view if needed
        activeChip.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        });
      }
    }
  });
}, observerOptions);

// Observe all menu sections
sections.forEach(section => observer.observe(section));

// Optional: Click handler for chips (smooth scroll fallback)
chips.forEach(chip => {
  chip.addEventListener('click', (e) => {
    const targetId = chip.getAttribute('href').slice(1);
    const targetSection = document.getElementById(targetId);
    
    if (targetSection) {
      e.preventDefault();
      targetSection.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
      
      // Update URL hash without jumping
      history.pushState(null, null, `#${targetId}`);
    }
  });
});

// Set initial active chip on page load
window.addEventListener('DOMContentLoaded', () => {
  const hash = window.location.hash.slice(1);
  if (hash && chips.has(hash)) {
    chips.get(hash).setAttribute('aria-current', 'true');
  } else if (sections.length > 0) {
    // Default to first section
    const firstChip = chips.get(sections[0].id);
    if (firstChip) firstChip.setAttribute('aria-current', 'true');
  }
});
