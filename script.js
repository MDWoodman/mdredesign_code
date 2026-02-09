document.querySelectorAll('[data-target]').forEach(button=>{
  button.addEventListener('click',()=>{
    const targetId = button.getAttribute('data-target');
    document.getElementById(targetId).scrollIntoView({behavior:'smooth'});
  });
});

const zoomOverlay = document.getElementById('image-zoom');
const zoomImage = zoomOverlay ? zoomOverlay.querySelector('img') : null;

if (zoomOverlay && zoomImage) {
  document.querySelectorAll('.zoomable').forEach(img => {
    img.addEventListener('mouseenter', () => {
      zoomImage.src = img.src;
      zoomImage.alt = img.alt || 'Powiekszony obraz';
      zoomOverlay.classList.add('is-visible');
      zoomOverlay.setAttribute('aria-hidden', 'false');
    });
  });

  zoomOverlay.addEventListener('mouseleave', () => {
    zoomOverlay.classList.remove('is-visible');
    zoomOverlay.setAttribute('aria-hidden', 'true');
  });

  zoomOverlay.addEventListener('click', () => {
    zoomOverlay.classList.remove('is-visible');
    zoomOverlay.setAttribute('aria-hidden', 'true');
  });
}

document.querySelectorAll('[data-carousel]').forEach(carousel => {
  const track = carousel.querySelector('.carousel-track');
  const slides = Array.from(track.querySelectorAll('img'));
  const prev = carousel.querySelector('.carousel-btn.prev');
  const next = carousel.querySelector('.carousel-btn.next');
  let index = 0;

  const update = () => {
    track.style.transform = `translateX(-${index * 100}%)`;
  };

  prev.addEventListener('click', () => {
    index = (index - 1 + slides.length) % slides.length;
    update();
  });

  next.addEventListener('click', () => {
    index = (index + 1) % slides.length;
    update();
  });
});