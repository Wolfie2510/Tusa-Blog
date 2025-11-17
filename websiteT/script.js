document.addEventListener('DOMContentLoaded', () => {
  // copyright
  const y = new Date().getFullYear();
  document.getElementById('year')?.textContent = y;

  // mobile nav toggle
  const navToggle = document.getElementById('navToggle');
  const mainNav = document.getElementById('mainNav');

  if (navToggle && mainNav) {
    navToggle.addEventListener('click', () => {
      if (mainNav.classList.contains('open')) {
        mainNav.classList.remove('open');
        mainNav.style.display = '';
      } else {
        mainNav.classList.add('open');
        mainNav.style.display = 'block';
      }
    });
  }
});
