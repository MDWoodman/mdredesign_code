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

  if (product.status) {
    const statusBadge = document.createElement('div');
    statusBadge.className = 'product-status';
    if (product.status === 'dostępny') {
      statusBadge.classList.add('status-available');
      statusBadge.textContent = '✓ Dostępny';
    } else if (product.status === 'sprzedany') {
      statusBadge.classList.add('status-sold');
      statusBadge.textContent = '✕ Sprzedany';
    } else {
      statusBadge.classList.add('status-unavailable');
      statusBadge.textContent = '✕ Niedostępny';
    }
    carousel.appendChild(statusBadge);
  }

  const prev = document.createElement('button');
  prev.className = 'carousel-btn prev';
  prev.type = 'button';
  prev.setAttribute('aria-label', 'Poprzedni obraz');
  prev.textContent = '‹';

  const next = document.createElement('button');
  next.className = 'carousel-btn next';
  next.type = 'button';
  next.setAttribute('aria-label', 'Nastepny obraz');
  next.textContent = '›';

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
  if (product.tags && Array.isArray(product.tags) && product.tags.length > 0) {
    const tagsContainer = document.createElement('div');
    tagsContainer.className = 'product-tags';
    product.tags.forEach(tag => {
      const tagBadge = document.createElement('span');
      tagBadge.className = 'product-tag';
      tagBadge.textContent = tag;
      tagsContainer.appendChild(tagBadge);
    });
    figcaption.appendChild(tagsContainer);
  }
  if (product.beforeImages && Array.isArray(product.beforeImages) && product.beforeImages.length > 0) {
    const beforeSection = document.createElement('div');
    beforeSection.className = 'before-renovation';
    
    const beforeTitle = document.createElement('span');
    beforeTitle.className = 'before-renovation-title';
    beforeTitle.textContent = '📸 Przed renowacją:';
    beforeSection.appendChild(beforeTitle);
    
    const beforeGallery = document.createElement('div');
    beforeGallery.className = 'before-images';
    product.beforeImages.forEach((src, idx) => {
      const img = document.createElement('img');
      img.className = 'before-image zoomable';
      img.src = src;
      img.alt = `${product.title} - przed renowacją ${idx + 1}`;
      img.loading = 'lazy';
      bindZoom(img);
      beforeGallery.appendChild(img);
    });
    beforeSection.appendChild(beforeGallery);
    figcaption.appendChild(beforeSection);
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
      return Promise.resolve();
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

const initGalleryScrollButtons = () => {
  document.querySelectorAll('.gallery-scroll-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const sectionKey = btn.getAttribute('data-gallery-nav');
      const gallery = document.querySelector(`[data-gallery="${sectionKey}"]`);
      if (!gallery) return;
      
      const scrollAmount = 424;
      const isPrev = btn.classList.contains('gallery-scroll-prev');
      
      gallery.scrollBy({
        left: isPrev ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    });
  });
};

buildGallery().then(() => {
  initGalleryScrollButtons();
});
setPublishDate();