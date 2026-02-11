document.querySelectorAll('[data-target]').forEach(button=>{
  button.addEventListener('click',()=>{
    const targetId = button.getAttribute('data-target');
    document.getElementById(targetId).scrollIntoView({behavior:'smooth'});
  });
});

const setPublishDate = () => {
  const target = document.querySelector('[data-publish-date]');
  if (!target) {
    return;
  }
  const now = new Date();
  const formatted = now.toLocaleString('pl-PL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  target.textContent = `Publikacja: ${formatted}`;
};

const zoomOverlay = document.getElementById('image-zoom');
const zoomImage = zoomOverlay ? zoomOverlay.querySelector('img') : null;
const galleryDataPath = 'gallery.json';

const bindZoom = img => {
  if (!zoomOverlay || !zoomImage) {
    return;
  }
  img.addEventListener('click', () => {
    zoomImage.src = img.src;
    zoomImage.alt = img.alt || 'Powiekszony obraz';
    zoomOverlay.classList.add('is-visible');
    zoomOverlay.setAttribute('aria-hidden', 'false');
  });
};

const initCarousel = carousel => {
  const track = carousel.querySelector('.carousel-track');
  const slides = Array.from(track.querySelectorAll('img'));
  const prev = carousel.querySelector('.carousel-btn.prev');
  const next = carousel.querySelector('.carousel-btn.next');
  let index = 0;

  const update = () => {
    track.style.transform = `translateX(-${index * 100}%)`;
  };

  if (slides.length <= 1) {
    prev.style.display = 'none';
    next.style.display = 'none';
    return;
  }

  prev.addEventListener('click', () => {
    index = (index - 1 + slides.length) % slides.length;
    update();
  });

  next.addEventListener('click', () => {
    index = (index + 1) % slides.length;
    update();
  });
};

const buildGalleryItem = product => {
  const figure = document.createElement('figure');
  figure.className = 'gallery-item';

  const carousel = document.createElement('div');
  carousel.className = 'carousel';
  carousel.setAttribute('data-carousel', '');

  const prev = document.createElement('button');
  prev.className = 'carousel-btn prev';
  prev.type = 'button';
  prev.setAttribute('aria-label', 'Poprzedni obraz');
  prev.textContent = '<';

  const next = document.createElement('button');
  next.className = 'carousel-btn next';
  next.type = 'button';
  next.setAttribute('aria-label', 'Nastepny obraz');
  next.textContent = '>';

  const track = document.createElement('div');
  track.className = 'carousel-track';

  product.images.forEach((src, idx) => {
    const img = document.createElement('img');
    img.className = 'zoomable';
    img.src = src;
    img.alt = product.title ? `${product.title} ${idx + 1}` : `Realizacja ${idx + 1}`;
    bindZoom(img);
    track.appendChild(img);
  });

  carousel.append(prev, track, next);

  const figcaption = document.createElement('figcaption');
  if (product.title) {
    const title = document.createElement('span');
    title.className = 'gallery-title';
    title.textContent = product.title;
    figcaption.appendChild(title);
  }
  if (product.description) {
    const desc = document.createElement('span');
    desc.className = 'gallery-desc';
    desc.textContent = product.description;
    figcaption.appendChild(desc);
  }

  figure.append(carousel, figcaption);
  initCarousel(carousel);

  return figure;
};

const buildGallery = async () => {
  try {
    const response = await fetch(galleryDataPath, { cache: 'no-store' });
    if (!response.ok) {
      console.warn('Brak pliku gallery.json.');
      return;
    }
    const data = await response.json();

    Object.entries(data).forEach(([sectionKey, products]) => {
      const container = document.querySelector(`[data-gallery="${sectionKey}"]`);
      if (!container || !Array.isArray(products)) {
        return;
      }
      container.innerHTML = '';
      products.forEach(product => {
        if (!product || !Array.isArray(product.images) || product.images.length === 0) {
          return;
        }
        container.appendChild(buildGalleryItem(product));
      });
    });
  } catch (error) {
    console.warn('Nie udalo sie wczytac galerii.', error);
  }
};

if (zoomOverlay) {
  zoomOverlay.addEventListener('click', () => {
    zoomOverlay.classList.remove('is-visible');
    zoomOverlay.setAttribute('aria-hidden', 'true');
  });
}

buildGallery();
setPublishDate();