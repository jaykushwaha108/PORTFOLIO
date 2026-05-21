document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================================================
       1. Theme Toggle (Dark / Light Mode)
       ========================================================================== */
    const themeToggleBtn = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;
    const themeIcon = themeToggleBtn.querySelector('i');
    
    // Check local storage or system preference
    const savedTheme = localStorage.getItem('portfolio-theme');
    const systemPrefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
    
    if (savedTheme === 'light' || (!savedTheme && systemPrefersLight)) {
        htmlElement.setAttribute('data-theme', 'light');
        themeIcon.className = 'fa-solid fa-sun';
    } else {
        htmlElement.setAttribute('data-theme', 'dark');
        themeIcon.className = 'fa-solid fa-moon';
    }

    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        if (currentTheme === 'dark') {
            htmlElement.setAttribute('data-theme', 'light');
            themeIcon.className = 'fa-solid fa-sun';
            localStorage.setItem('portfolio-theme', 'light');
        } else {
            htmlElement.setAttribute('data-theme', 'dark');
            themeIcon.className = 'fa-solid fa-moon';
            localStorage.setItem('portfolio-theme', 'dark');
        }
    });

    /* ==========================================================================
       2. Sticky Header & Active Navigation Link Highlighter (ScrollSpy)
       ========================================================================== */
    const header = document.querySelector('.header');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section, main > section');
    const drawerLinks = document.querySelectorAll('.drawer-link');
    
    // Header shadow on scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Intersection Observer for Active Link
    const observerOptions = {
        root: null,
        rootMargin: '-30% 0px -60% 0px', // Trigger when section is in the middle of the viewport
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                
                // Update desktop links
                navLinks.forEach(link => {
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    } else {
                        link.classList.remove('active');
                    }
                });
                
                // Update mobile drawer links
                drawerLinks.forEach(link => {
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    } else {
                        link.classList.remove('active');
                    }
                });
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        observer.observe(section);
    });

    /* ==========================================================================
       3. Mobile Navigation Drawer Menu
       ========================================================================== */
    const menuToggle = document.getElementById('menu-toggle');
    const mobileDrawer = document.getElementById('mobile-drawer');

    function toggleMenu() {
        menuToggle.classList.toggle('open');
        mobileDrawer.classList.toggle('open');
        // Prevent body scrolling when menu is open
        document.body.style.overflow = mobileDrawer.classList.contains('open') ? 'hidden' : '';
    }

    menuToggle.addEventListener('click', toggleMenu);

    // Close drawer when any link is clicked
    document.querySelectorAll('.drawer-link').forEach(link => {
        link.addEventListener('click', () => {
            if (mobileDrawer.classList.contains('open')) {
                toggleMenu();
            }
        });
    });

    // Close drawer when clicking outside it
    document.addEventListener('click', (e) => {
        if (mobileDrawer.classList.contains('open') && 
            !mobileDrawer.contains(e.target) && 
            !menuToggle.contains(e.target)) {
            toggleMenu();
        }
    });

    /* ==========================================================================
       4. Hero Particle Canvas Animation (PCB Grid/Signals Style)
       ========================================================================== */
    const canvas = document.getElementById('hero-canvas');
    const ctx = canvas.getContext('2d');
    
    let particles = [];
    let particleCount = 45;
    
    // Set Canvas Size
    function setCanvasSize() {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    }
    
    setCanvasSize();
    window.addEventListener('resize', () => {
        setCanvasSize();
        initParticles();
    });

    // Particle Constructor
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * 0.6; // Speed X
            this.vy = (Math.random() - 0.5) * 0.6; // Speed Y
            this.radius = Math.random() * 2 + 1.5;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            // Bounce off edges
            if (this.x < 0 || this.x > canvas.width) this.vx = -this.vx;
            if (this.y < 0 || this.y > canvas.height) this.vy = -this.vy;
        }

        draw(color) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();
        }
    }

    function initParticles() {
        particles = [];
        // Adjust particle count based on screen width
        if (canvas.width < 768) {
            particleCount = 20;
        } else {
            particleCount = 45;
        }
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }
    }

    initParticles();

    // Animation Loop
    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Dynamically fetch accent colors based on theme
        const isDarkTheme = htmlElement.getAttribute('data-theme') === 'dark';
        const particleColor = isDarkTheme ? 'rgba(0, 242, 254, 0.4)' : 'rgba(2, 132, 199, 0.3)';
        const lineColorRgb = isDarkTheme ? '0, 242, 254' : '2, 132, 199';
        
        // Update and draw particles
        particles.forEach(p => {
            p.update();
            p.draw(particleColor);
        });

        // Draw connections
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dist = Math.hypot(particles[i].x - particles[j].x, particles[i].y - particles[j].y);
                
                // Connection distance threshold
                if (dist < 150) {
                    const alpha = (1 - dist / 150) * 0.15; // Fade lines as they move away
                    ctx.beginPath();
                    
                    // Constrain pathing style (like PCB traces: horizontal or vertical lines)
                    // Occasionally draw perpendicular paths to look like electric tracks
                    if (dist < 70) {
                        ctx.moveTo(particles[i].x, particles[i].y);
                        // Draw a nice angled corner path
                        ctx.lineTo(particles[j].x, particles[i].y); 
                        ctx.lineTo(particles[j].x, particles[j].y);
                    } else {
                        // Standard line
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                    }
                    
                    ctx.strokeStyle = `rgba(${lineColorRgb}, ${alpha})`;
                    ctx.lineWidth = 0.8;
                    ctx.stroke();
                }
            }
        }
        
        requestAnimationFrame(animateParticles);
    }
    
    animateParticles();

    /* ==========================================================================
       5. Contact Form Submission Handling
       ========================================================================== */
    const contactForm = document.getElementById('contact-form');
    const formSuccess = document.getElementById('form-success');

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Simple visual loading effect
            const submitBtn = contactForm.querySelector('.btn-submit');
            const originalBtnContent = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = 'Sending... <i class="fa-solid fa-spinner fa-spin"></i>';
            
            // Simulate form submission to backend (e.g., mailto/server check)
            setTimeout(() => {
                contactForm.classList.add('hidden');
                formSuccess.classList.remove('hidden');
                contactForm.reset();
            }, 1200);
        });
    }

    // Scroll Indicator Click Event
    const scrollDownIndicator = document.querySelector('.scroll-down');
    if (scrollDownIndicator) {
        scrollDownIndicator.addEventListener('click', () => {
            const aboutSection = document.getElementById('about');
            if (aboutSection) {
                aboutSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }
});
