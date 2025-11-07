// Animate words on page load
function animateWords() {
  const words = document.querySelectorAll('.word');
  words.forEach((word) => {
    const delay = parseInt(word.getAttribute('data-delay') || '0', 10);
    setTimeout(() => {
      word.style.animation = 'word-appear 0.8s ease-out forwards';
    }, delay);
  });
}

// Mouse gradient effect
function initializeMouseGradient() {
  const gradientRef = document.getElementById('mouse-gradient');
  
  function onMouseMove(e) {
    if (gradientRef) {
      gradientRef.style.left = e.clientX - 192 + 'px';
      gradientRef.style.top = e.clientY - 192 + 'px';
      gradientRef.style.opacity = '1';
    }
  }
  
  function onMouseLeave() {
    if (gradientRef) gradientRef.style.opacity = '0';
  }
  
  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseleave', onMouseLeave);
}

// Word hover effects
function initializeWordHovers() {
  const words = document.querySelectorAll('.word');
  words.forEach((word) => {
    word.addEventListener('mouseenter', () => {
      word.style.textShadow = '0 0 20px rgba(189, 147, 249, 0.5)';
    });
    word.addEventListener('mouseleave', () => {
      word.style.textShadow = 'none';
    });
  });
}

// Click ripple effect
function initializeClickRipple() {
  function onClick(e) {
    const ripple = document.createElement('div');
    ripple.style.position = 'fixed';
    ripple.style.left = e.clientX + 'px';
    ripple.style.top = e.clientY + 'px';
    ripple.style.width = '4px';
    ripple.style.height = '4px';
    ripple.style.background = 'rgba(189, 147, 249, 0.6)';
    ripple.style.borderRadius = '50%';
    ripple.style.transform = 'translate(-50%, -50%)';
    ripple.style.pointerEvents = 'none';
    ripple.style.animation = 'pulse-glow 1s ease-out forwards';
    document.body.appendChild(ripple);
    setTimeout(() => ripple.remove(), 1000);
  }
  document.addEventListener('click', onClick);
}

// Floating elements on scroll
function initializeScrollAnimation() {
  let scrolled = false;
  function onScroll() {
    if (!scrolled) {
      scrolled = true;
      document.querySelectorAll('.floating-element').forEach((el, index) => {
        setTimeout(() => {
          el.style.animationPlayState = 'running';
        }, index * 200);
      });
    }
  }
  window.addEventListener('scroll', onScroll);
}

// Initialize all effects
document.addEventListener('DOMContentLoaded', () => {
  animateWords();
  initializeMouseGradient();
  initializeWordHovers();
  initializeClickRipple();
  initializeScrollAnimation();
});
