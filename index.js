document.addEventListener('DOMContentLoaded', () => {

  // 1. THEME SWITCHER (DARK / LIGHT MODE)
  const themeSwitch = document.getElementById('theme-switch');
  const htmlElement = document.documentElement;

  // Retrieve saved theme or check system default
  const savedTheme = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (savedTheme) {
    htmlElement.setAttribute('data-theme', savedTheme);
  } else if (systemPrefersDark) {
    htmlElement.setAttribute('data-theme', 'dark');
  }

  themeSwitch.addEventListener('click', () => {
    const currentTheme = htmlElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    htmlElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    showToast(`Switched to ${newTheme} mode!`, 'success');
  });

  // 2. MOBILE MENU HAMBURGER DRAWER
  const mobileToggle = document.getElementById('mobile-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  mobileToggle.addEventListener('click', () => {
    mobileToggle.classList.toggle('open');
    navMenu.classList.toggle('open');
  });

  // Close mobile menu when clicking nav links
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      mobileToggle.classList.remove('open');
      navMenu.classList.remove('open');
    });
  });

  // 3. HEADER STYLE ON SCROLL
  const header = document.getElementById('header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // 4. BACK TO TOP BUTTON
  const backToTopBtn = document.getElementById('back-to-top');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      backToTopBtn.classList.add('visible');
    } else {
      backToTopBtn.classList.remove('visible');
    }
  });

  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

  // 5. INTERSECTION OBSERVER FOR REVEAL ANIMATIONS
  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        revealObserver.unobserve(entry.target); // Trigger only once
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(elem => revealObserver.observe(elem));

  // 6. STATISTICS COUNT-UP ANIMATION
  const statNumbers = document.querySelectorAll('.stat-number');
  
  const animateStats = (entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        statNumbers.forEach(stat => {
          const target = parseInt(stat.getAttribute('data-target'), 10);
          const duration = 2000; // 2 seconds
          const start = 0;
          const startTime = performance.now();

          const updateNumber = (currentTime) => {
            const elapsedTime = currentTime - startTime;
            if (elapsedTime >= duration) {
              stat.textContent = formatNumber(target) + "+";
              return;
            }
            const progress = elapsedTime / duration;
            // Ease out quad formula
            const easeProgress = progress * (2 - progress);
            const currentVal = Math.round(start + (target - start) * easeProgress);
            stat.textContent = formatNumber(currentVal) + "+";
            requestAnimationFrame(updateNumber);
          };

          requestAnimationFrame(updateNumber);
        });
        observer.unobserve(entry.target); // Run only once
      }
    });
  };

  const statsObserver = new IntersectionObserver(animateStats, {
    threshold: 0.2
  });

  const statsSection = document.querySelector('.stats');
  if (statsSection) {
    statsObserver.observe(statsSection);
  }

  // Format numbers with comma grouping
  function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  // 7. INTERACTIVE DONATION PORTAL
  const donationAmountInput = document.getElementById('donation-amount');
  const donationPresetBtns = document.querySelectorAll('.donation-opt-btn');
  const donationImpactText = document.getElementById('donation-impact');
  const donateSubmitBtn = document.getElementById('donate-submit');

  // Donation impact mappings based on amount
  function updateDonationImpact(amount) {
    let impactMsg = "";
    if (!amount || amount < 100) {
      impactMsg = "Please enter an amount of ₹100 or more to make an impact.";
    } else if (amount < 500) {
      impactMsg = `₹${formatNumber(amount)} supports general administrative operations and stray animal feeding drives.`;
    } else if (amount < 1000) {
      impactMsg = `₹${formatNumber(amount)} provides a comprehensive stationery set and coloring kit to 1 child in a village.`;
    } else if (amount < 2500) {
      impactMsg = `₹${formatNumber(amount)} sponsors school notebooks, backpacks, writing materials, and uniform sets for 1 child.`;
    } else if (amount < 5000) {
      impactMsg = `₹${formatNumber(amount)} sponsors 1 child's school fees, monthly tutoring support, and basic health checkups for a semester.`;
    } else {
      impactMsg = `₹${formatNumber(amount)} funds a health and sanitation camp, distributing biodegradable sanitary kits to 50 girls.`;
    }
    donationImpactText.textContent = impactMsg;
  }

  // Preset button clicks
  donationPresetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      donationPresetBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const val = btn.getAttribute('data-value');
      donationAmountInput.value = val;
      updateDonationImpact(parseInt(val, 10));
    });
  });

  // Custom amount typing inputs
  donationAmountInput.addEventListener('input', () => {
    const val = parseInt(donationAmountInput.value, 10) || 0;
    
    // Check if typed value matches a preset
    let matchedPreset = false;
    donationPresetBtns.forEach(btn => {
      if (btn.getAttribute('data-value') == val) {
        btn.classList.add('active');
        matchedPreset = true;
      } else {
        btn.classList.remove('active');
      }
    });

    updateDonationImpact(val);
  });

  // Simulated Donation Submission
  donateSubmitBtn.addEventListener('click', () => {
    const amount = parseInt(donationAmountInput.value, 10);
    if (isNaN(amount) || amount < 100) {
      showToast("Please enter a donation amount of ₹100 or above.", "error");
      return;
    }

    donateSubmitBtn.disabled = true;
    const originalContent = donateSubmitBtn.innerHTML;
    donateSubmitBtn.innerHTML = `Processing Secure Payment...`;

    setTimeout(() => {
      donateSubmitBtn.disabled = false;
      donateSubmitBtn.innerHTML = originalContent;
      
      showToast(`Thank you! A donation of ₹${formatNumber(amount)} was received. An 80G tax receipt has been emailed to you.`, "success");
      
      // Reset widgets
      donationAmountInput.value = 1000;
      donationPresetBtns.forEach(btn => {
        if (btn.getAttribute('data-value') === "1000") btn.classList.add('active');
        else btn.classList.remove('active');
      });
      updateDonationImpact(1000);
    }, 1800);
  });

  // 8. CONTACT FORM SUBMISSION WITH VALIDATION
  const contactForm = document.getElementById('contact-form');
  const contactSubmitBtn = document.getElementById('contact-submit');

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const nameVal = document.getElementById('form-name').value.trim();
    const emailVal = document.getElementById('form-email').value.trim();
    const subjectVal = document.getElementById('form-subject').value.trim();
    const messageVal = document.getElementById('form-message').value.trim();

    // Basic Validation
    if (!nameVal || !emailVal || !subjectVal || !messageVal) {
      showToast("Please fill in all the contact form fields.", "error");
      return;
    }

    if (!validateEmail(emailVal)) {
      showToast("Please enter a valid email address.", "error");
      return;
    }

    // Submit animation simulation
    contactSubmitBtn.disabled = true;
    const originalContent = contactSubmitBtn.innerHTML;
    contactSubmitBtn.innerHTML = `Sending Message...`;

    setTimeout(() => {
      contactSubmitBtn.disabled = false;
      contactSubmitBtn.innerHTML = originalContent;
      
      showToast("Message sent! A NayePankh support representative will contact you shortly.", "success");
      contactForm.reset();
    }, 1200);
  });

  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  // 9. TOAST NOTIFICATION GENERATOR
  const toastContainer = document.getElementById('toast-container');

  function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    // Custom inline SVGs for toast statuses
    const checkIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
    const errorIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
    
    const icon = type === 'success' ? checkIcon : errorIcon;
    
    toast.innerHTML = `
      ${icon}
      <span>${message}</span>
    `;

    toastContainer.appendChild(toast);

    // Fade out and remove toast after 4s
    setTimeout(() => {
      toast.classList.add('fade-out');
      toast.addEventListener('animationend', () => {
        toast.remove();
      });
    }, 4000);
  }

  // Initial trigger for donation impact widget
  updateDonationImpact(1000);
});
