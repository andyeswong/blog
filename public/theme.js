// Theme toggle functionality
document.addEventListener('DOMContentLoaded', () => {
  const html = document.documentElement;
  const themeToggle = document.getElementById('theme-toggle');
  
  // Get saved theme or default to 'dark'
  const savedTheme = localStorage.getItem('theme') || 'dark';
  
  // Set initial theme
  html.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);
  
  // Handle theme toggle
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const currentTheme = html.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      
      html.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      updateThemeIcon(newTheme);
    });
  }
  
  function updateThemeIcon(theme) {
    if (themeToggle) {
      themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
      themeToggle.title = theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro';
    }
  }
});
