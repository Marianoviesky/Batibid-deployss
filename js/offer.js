document.addEventListener("DOMContentLoaded", function () {
  const slides = document.querySelectorAll(".bb-offer-slide");
  const dots = document.querySelectorAll(".bb-offer-dot");
  const container = document.querySelector(".bb-offers-card");
  
  if (!slides.length) return;

  let currentIndex = 0;
  const slideIntervalTime = 3000; // 3 secondes
  let slideInterval;

  function showSlide(index) {
    slides.forEach((slide, i) => {
      if (i === index) {
        slide.classList.add("active");
      } else {
        slide.classList.remove("active");
      }
    });

    dots.forEach((dot, i) => {
      dot.classList.toggle("active", i === index);
    });

    currentIndex = index;
  }

  function nextSlide() {
    let nextIndex = (currentIndex + 1) % slides.length;
    showSlide(nextIndex);
  }

  function startTimer() {
    slideInterval = setInterval(nextSlide, slideIntervalTime);
  }

  function stopTimer() {
    clearInterval(slideInterval);
  }

  // Permet au bouton dot de changer directement de slide
  window.bbJumpToSlide = function(index) {
    stopTimer();
    showSlide(index);
    startTimer();
  };

  // Met en pause la rotation automatique quand l'utilisateur survole la carte
  if (container) {
    container.addEventListener("mouseenter", stopTimer);
    container.addEventListener("mouseleave", startTimer);
  }

  // Démarrage automatique du carrousel
  startTimer();
});