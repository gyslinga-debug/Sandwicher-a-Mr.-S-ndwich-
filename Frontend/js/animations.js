// Sistema de animaciones para Mr. Sándwich
// Aplica animaciones cuando los elementos entran en el viewport

document.addEventListener('DOMContentLoaded', function() {
  // Inicializar Intersection Observer para animaciones on scroll
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observar elementos con clases de animación
  const animatedElements = document.querySelectorAll(
    '.fade-in-up, .slide-in-left, .slide-in-right, .scale-in, .stagger-animation > *'
  );
  
  animatedElements.forEach(el => {
    observer.observe(el);
  });

  // Animar tarjetas de productos en grid
  const productCards = document.querySelectorAll('.product-card');
  productCards.forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    
    setTimeout(() => {
      card.style.transition = 'all 0.6s ease-out';
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }, index * 100);
  });

  // Animar estadísticas en dashboard
  const statCards = document.querySelectorAll('.stat-card');
  statCards.forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'scale(0.9)';
    
    setTimeout(() => {
      card.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
      card.style.opacity = '1';
      card.style.transform = 'scale(1)';
    }, index * 150);
  });

  // Animar elementos de formulario al hacer focus
  const formControls = document.querySelectorAll('.form-control, .form-select');
  formControls.forEach(control => {
    control.addEventListener('focus', function() {
      this.parentElement?.classList.add('form-group-focused');
    });
    
    control.addEventListener('blur', function() {
      this.parentElement?.classList.remove('form-group-focused');
    });
  });

  // Efecto ripple en botones
  const buttons = document.querySelectorAll('.btn');
  buttons.forEach(button => {
    button.addEventListener('click', function(e) {
      const ripple = document.createElement('span');
      ripple.classList.add('ripple-effect');
      
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;
      
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = x + 'px';
      ripple.style.top = y + 'px';
      
      this.appendChild(ripple);
      
      setTimeout(() => ripple.remove(), 600);
    });
  });

  // Animar números en contadores (para estadísticas)
  function animateCounter(element, target, duration = 2000) {
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        element.textContent = Math.round(target);
        clearInterval(timer);
      } else {
        element.textContent = Math.round(current);
      }
    }, 16);
  }

  // Aplicar animación de contador a elementos con clase .counter
  const counters = document.querySelectorAll('.counter');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = parseInt(entry.target.dataset.target || entry.target.textContent);
        animateCounter(entry.target, target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(counter => {
    counterObserver.observe(counter);
  });

  // Añadir clase a elementos al hacer scroll
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    // Animar navbar al hacer scroll
    const navbar = document.querySelector('.navbar, header.site-header');
    if (navbar) {
      if (currentScroll > 100) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }
    
    lastScroll = currentScroll;
  });

  // Efecto parallax suave en hero
  const heroVisual = document.querySelector('.hero-visual');
  if (heroVisual) {
    window.addEventListener('scroll', () => {
      const scrolled = window.pageYOffset;
      heroVisual.style.transform = `translateY(${scrolled * 0.3}px)`;
    });
  }

  // Animar elementos con datos al cargar
  setTimeout(() => {
    document.body.classList.add('loaded');
  }, 100);

  // Smooth reveal para imágenes
  const images = document.querySelectorAll('img');
  images.forEach(img => {
    img.addEventListener('load', function() {
      this.classList.add('loaded');
    });
    
    // Si la imagen ya está cargada
    if (img.complete) {
      img.classList.add('loaded');
    }
  });
});

// Añadir estilos CSS dinámicos para efectos
const style = document.createElement('style');
style.textContent = `
  .ripple-effect {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.6);
    transform: scale(0);
    animation: ripple 0.6s ease-out;
    pointer-events: none;
  }

  @keyframes ripple {
    to {
      transform: scale(2);
      opacity: 0;
    }
  }

  .form-group-focused {
    transform: scale(1.02);
    transition: transform 0.3s ease;
  }

  .navbar.scrolled, header.site-header.scrolled {
    box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    transition: box-shadow 0.3s ease;
  }

  img {
    opacity: 0;
    transition: opacity 0.5s ease;
  }

  img.loaded {
    opacity: 1;
  }

  body {
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  body.loaded {
    opacity: 1;
  }

  .animate-in {
    animation-play-state: running !important;
  }
`;
document.head.appendChild(style);
