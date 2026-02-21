// Mobile menu toggle
const menuToggle = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('.mobile-menu');
const menuIcon = document.querySelector('.menu-icon');
const closeIcon = document.querySelector('.close-icon');
const navbar = document.querySelector('.navbar');

menuToggle?.addEventListener('click', () => {
  mobileMenu?.classList.toggle('hidden');
  menuIcon?.style.display = mobileMenu?.classList.contains('hidden') ? 'block' : 'none';
  closeIcon?.style.display = mobileMenu?.classList.contains('hidden') ? 'none' : 'block';
});

// Close mobile menu when a link is clicked
document.querySelectorAll('.nav-link-mobile').forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu?.classList.add('hidden');
    menuIcon?.style.display = 'block';
    closeIcon?.style.display = 'none';
  });
});

// Navbar background on scroll
window.addEventListener('scroll', () => {
  if (window.scrollY > 20) {
    navbar?.classList.add('scrolled');
  } else {
    navbar?.classList.remove('scrolled');
  }
});

// Active nav link
document.querySelectorAll('.nav-link').forEach(link => {
  if (link.getAttribute('href') === window.location.pathname) {
    link.classList.add('active');
  }
  
  link.addEventListener('click', () => {
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    link.classList.add('active');
  });
});
