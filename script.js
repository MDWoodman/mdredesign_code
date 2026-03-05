document.querySelectorAll('[data-target]').forEach(button=>{
  button.addEventListener('click',()=>{
    const targetId = button.getAttribute('data-target');
    document.getElementById(targetId).scrollIntoView({behavior:'smooth'});
  });
});

const initMobileNav = () => {
  const nav = document.querySelector('.nav');
  if (!nav) {
    return;
  }

  const toggle = nav.querySelector('.nav-toggle');
  const navItems = nav.querySelectorAll('ul [data-target]');

  if (!toggle) {
    return;
  }

  toggle.addEventListener('click', () => {
    const willOpen = !nav.classList.contains('nav-open');
    nav.classList.toggle('nav-open', willOpen);
    toggle.setAttribute('aria-expanded', String(willOpen));
  });

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      if (!window.matchMedia('(max-width: 768px)').matches) {
        return;
      }
      nav.classList.remove('nav-open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
};

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

const setVisitCount = () => {
  const target = document.querySelector('[data-visit-count]');
  if (!target) {
    return;
  }

  const key = 'mdredesign_visit_count';
  let visits = 0;

  try {
    const stored = Number.parseInt(localStorage.getItem(key) || '0', 10);
    visits = Number.isNaN(stored) || stored < 0 ? 0 : stored;
    visits += 1;
    localStorage.setItem(key, String(visits));
  } catch (error) {
    visits = 1;
    console.warn('Nie udalo sie zapisac licznika wejsc.', error);
  }

  target.textContent = `Liczba wejść: ${visits}`;
};

const zoomOverlay = document.getElementById('image-zoom');
const zoomImage = zoomOverlay ? zoomOverlay.querySelector('img') : null;
const galleryDataPath = 'gallery.json';
const arrangementsDataPath = 'aranzacje.json'; 
const catalogsDataPaths = ['katalogi.json', 'katalogi.php'];
const galleryFilterButtons = Array.from(document.querySelectorAll('[data-gallery-filter]'));
const GALLERY_FILTER_ALL = 'all';
const GALLERY_FILTER_MAP = {
  renowacje: ['renowacje', 'renowacja', 'odrestaurowane', 'odrestaurowany', 'restaurowane', 'restaurowany'],
  nowe: ['nowe', 'nowy', 'new'],
  przerobione: ['przerobione', 'przerobiony', 'przeksztalcone', 'przeksztalcony', 'upcycling', 'upcykling']
};

let galleryData = null;
let activeGalleryFilter = GALLERY_FILTER_ALL;

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
  if (product.price) {
    const price = document.createElement('span');
    price.className = 'gallery-price';
    price.textContent = `Cena: ${product.price}`;
    figcaption.appendChild(price);
  }

  const allegroUrl = typeof product.allegroUrl === 'string'
    ? product.allegroUrl.trim()
    : typeof product.allegroLink === 'string'
      ? product.allegroLink.trim()
      : typeof product.allegro === 'string'
        ? product.allegro.trim()
        : '';

  if (allegroUrl) {
    const allegroLink = document.createElement('a');
    allegroLink.className = 'allegro-link';
    allegroLink.href = allegroUrl;
    allegroLink.target = '_blank';
    allegroLink.rel = 'noopener noreferrer';
    allegroLink.setAttribute('aria-label', 'Przejdź do oferty Allegro');

    const allegroIcon = document.createElement('span');
    allegroIcon.className = 'allegro-icon';
    allegroIcon.setAttribute('aria-hidden', 'true');
    allegroIcon.textContent = 'a';

    const allegroText = document.createElement('span');
    allegroText.textContent = 'Allegro';

    allegroLink.append(allegroIcon, allegroText);
    figcaption.appendChild(allegroLink);
  }

  figure.append(carousel, figcaption);
  initCarousel(carousel);

  return figure;
};

const normalizeGalleryFilterValue = value => {
  if (typeof value !== 'string') {
    return '';
  }

  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\s_-]+/g, '');
};

const normalizeGalleryFilterKey = filter => {
  const normalized = normalizeGalleryFilterValue(filter);

  if (normalized === normalizeGalleryFilterValue('renowacje')) {
    return 'renowacje';
  }
  if (normalized === normalizeGalleryFilterValue('nowe')) {
    return 'nowe';
  }
  if (normalized === normalizeGalleryFilterValue('przerobione')) {
    return 'przerobione';
  }

  return GALLERY_FILTER_ALL;
};

const getGalleryProductFilterValues = product => {
  const collected = [];
  const keyFields = ['klucz', 'filterKey', 'galleryKey', 'key', 'kategoria', 'category', 'typ', 'type', 'rodzaj'];

  keyFields.forEach(field => {
    const value = product[field];
    if (typeof value === 'string' && value.trim()) {
      collected.push(value);
      return;
    }

    if (Array.isArray(value)) {
      value.forEach(entry => {
        if (typeof entry === 'string' && entry.trim()) {
          collected.push(entry);
        }
      });
    }
  });

  if (Array.isArray(product.tags)) {
    product.tags.forEach(tag => {
      if (typeof tag === 'string' && tag.trim()) {
        collected.push(tag);
      }
    });
  }

  return collected.map(normalizeGalleryFilterValue).filter(Boolean);
};

const isGalleryProductVisibleForFilter = (product, filter) => {
  if (filter === GALLERY_FILTER_ALL) {
    return true;
  }

  const expectedKeys = GALLERY_FILTER_MAP[filter] || [];
  if (expectedKeys.length === 0) {
    return false;
  }

  const normalizedExpected = expectedKeys.map(normalizeGalleryFilterValue);
  const productKeys = getGalleryProductFilterValues(product);

  return productKeys.some(value => normalizedExpected.includes(value));
};

const renderGallery = () => {
  if (!galleryData || typeof galleryData !== 'object') {
    return;
  }

  Object.entries(galleryData).forEach(([sectionKey, products]) => {
    const container = document.querySelector(`[data-gallery="${sectionKey}"]`);
    if (!container || !Array.isArray(products)) {
      return;
    }

    const filteredProducts = products.filter(product => {
      if (!product || !Array.isArray(product.images) || product.images.length === 0) {
        return false;
      }

      return isGalleryProductVisibleForFilter(product, activeGalleryFilter);
    });

    container.innerHTML = '';

    if (filteredProducts.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'gallery-status';
      empty.textContent = 'Brak produktów dla wybranego filtra.';
      container.appendChild(empty);
      return;
    }

    filteredProducts.forEach(product => {
      container.appendChild(buildGalleryItem(product));
    });
  });
};

const syncGalleryFilterButtons = () => {
  galleryFilterButtons.forEach(button => {
    const buttonFilter = normalizeGalleryFilterKey(button.getAttribute('data-gallery-filter') || GALLERY_FILTER_ALL);
    const isActive = buttonFilter === activeGalleryFilter;
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });
};

const initGalleryFilters = () => {
  if (galleryFilterButtons.length === 0) {
    return;
  }

  const initialActiveButton = galleryFilterButtons.find(button => button.classList.contains('is-active'));
  activeGalleryFilter = normalizeGalleryFilterKey(
    initialActiveButton ? initialActiveButton.getAttribute('data-gallery-filter') || GALLERY_FILTER_ALL : GALLERY_FILTER_ALL
  );
  syncGalleryFilterButtons();

  galleryFilterButtons.forEach(button => {
    button.addEventListener('click', () => {
      const requestedFilter = normalizeGalleryFilterKey(button.getAttribute('data-gallery-filter') || GALLERY_FILTER_ALL);
      if (requestedFilter === activeGalleryFilter) {
        return;
      }

      activeGalleryFilter = requestedFilter;
      syncGalleryFilterButtons();
      renderGallery();
    });
  });
};

const buildGallery = async () => {
  try {
    const response = await fetch(galleryDataPath, { cache: 'no-store' });
    if (!response.ok) {
      console.warn('Brak pliku gallery.json.');
      return;
    }
    galleryData = await response.json();
    renderGallery();
  } catch (error) {
    console.warn('Nie udalo sie wczytac galerii.', error);
  }
};

const fetchCatalogFiles = async () => {
  for (const path of catalogsDataPaths) {
    try {
      const response = await fetch(path, { cache: 'no-store' });
      if (!response.ok) {
        continue;
      }

      const data = await response.json();
      const files = Array.isArray(data.files) ? data.files : [];
      if (files.length > 0) {
        return files;
      }
    } catch (error) {
      console.warn(`Nie udalo sie wczytac danych katalogow z ${path}.`, error);
    }
  }

  return [];
};

const buildCatalogs = async () => {
  const container = document.querySelector('[data-catalogs]');
  if (!container) {
    return;
  }

  try {
    const files = await fetchCatalogFiles();

    container.innerHTML = '';

    if (files.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'catalogs-status';
      empty.textContent = 'Brak katalogow PDF do pobrania.';
      container.appendChild(empty);
      return;
    }

    const list = document.createElement('ul');
    list.className = 'catalogs-list';

    files.forEach(file => {
      if (!file || !file.url || !file.name) {
        return;
      }

      const item = document.createElement('li');
      item.className = 'catalogs-item';

      const link = document.createElement('a');
      link.className = 'catalog-link';
      link.href = file.url;
      link.textContent = file.name;
      link.setAttribute('download', file.name);

      item.appendChild(link);
      list.appendChild(item);
    });

    container.appendChild(list);
  } catch (error) {
    container.innerHTML = '';
    const failed = document.createElement('p');
    failed.className = 'catalogs-status';
    failed.textContent = 'Nie udalo sie wczytac katalogow PDF.';
    container.appendChild(failed);
    console.warn('Nie udalo sie wczytac katalogow PDF.', error);
  }
};

const buildArrangementItem = arrangement => {
  const article = document.createElement('article');
  article.className = 'arrangement-item';

  const image = document.createElement('img');
  image.className = 'arrangement-image zoomable';
  image.src = arrangement.image;
  image.alt = arrangement.title || 'Przykładowa aranżacja';
  image.loading = 'lazy';
  bindZoom(image);

  const content = document.createElement('div');
  content.className = 'arrangement-content';

  const title = document.createElement('h3');
  title.className = 'arrangement-title';
  title.textContent = arrangement.title || 'Przykładowa aranżacja';

  const desc = document.createElement('p');
  desc.className = 'arrangement-desc';
  desc.textContent = arrangement.description || '';

  content.append(title, desc);
  article.append(image, content);
  return article;
};

const buildArrangements = async () => {
  const container = document.querySelector('[data-arrangements]');
  if (!container) {
    return;
  }

  try {
    const response = await fetch(arrangementsDataPath, { cache: 'no-store' });
    if (!response.ok) {
      container.innerHTML = '';
      const empty = document.createElement('p');
      empty.className = 'arrangements-status';
      empty.textContent = 'Brak aranżacji do wyświetlenia.';
      container.appendChild(empty);
      return;
    }

    const data = await response.json();
    const items = Array.isArray(data.items) ? data.items : [];
    const enabled = data.enabled !== false;

    container.innerHTML = '';

    if (!enabled || items.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'arrangements-status';
      empty.textContent = 'Brak aranżacji do wyświetlenia.';
      container.appendChild(empty);
      return;
    }

    const grid = document.createElement('div');
    grid.className = 'arrangements-grid';

    items.forEach(item => {
      if (!item || item.visible === false || !item.image) {
        return;
      }
      grid.appendChild(buildArrangementItem(item));
    });

    if (!grid.hasChildNodes()) {
      const empty = document.createElement('p');
      empty.className = 'arrangements-status';
      empty.textContent = 'Brak aranżacji do wyświetlenia.';
      container.appendChild(empty);
      return;
    }

    container.appendChild(grid);
  } catch (error) {
    container.innerHTML = '';
    const failed = document.createElement('p');
    failed.className = 'arrangements-status';
    failed.textContent = 'Nie udało się wczytać aranżacji.';
    container.appendChild(failed);
    console.warn('Nie udalo sie wczytac aranżacji.', error);
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

initGalleryFilters();
buildGallery().then(() => {
  initGalleryScrollButtons();
});
buildArrangements();
buildCatalogs();
setVisitCount();
setPublishDate();
initMobileNav();